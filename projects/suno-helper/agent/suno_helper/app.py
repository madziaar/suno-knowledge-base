"""The agent app: a local HTTP server over the loop.

Why an app and not just the CLI?

The loop already writes ``/goal``, ``/subgoals``, a ledger and a proposals file.
Reading those from a terminal means ``cat`` and ``jq``; a 500-turn run is
otherwise opaque. This server exposes the *same* engine over HTTP and streams
each turn as it happens, so the run is watchable while it is running.

Design constraints, in order:

1. **Standard library only.** ``python3 -m suno_helper app`` must work on a
   machine with no virtualenv and no network. No FastAPI, no Flask, no npm.
2. **One writer.** The engine holds mutable state; every mutating route takes
   the same lock and refuses while a loop owns ``.suno-helper/loop.lock``.
3. **Writes are gated.** Reads are open on whatever interface you bind. Writes
   need a token as soon as the bind address is not loopback, because a server
   that runs arbitrary tool calls is not something to expose to a LAN by
   accident.
4. **The UI is a static asset, not a build step.** No bundler, no CDN. If the
   app cannot start offline, it is not local-first.
"""

from __future__ import annotations

import json
import mimetypes
import os
import re
import secrets
import threading
import time
import urllib.parse
from dataclasses import dataclass, field
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Callable, Iterable

from .capabilities import CAPABILITIES, readiness
from .engine import Engine
from .skills import SkillRegistry

WEBAPP_DIR = Path(__file__).parent / "webapp"
VERSION = "0.2.0"
MAX_TURN_BATCH = 200
LOOPBACK = {"127.0.0.1", "::1", "localhost"}


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def is_loopback(host: str) -> bool:
    return host in LOOPBACK


def _json_default(value: Any) -> Any:
    if isinstance(value, Path):
        return str(value)
    return str(value)


def dumps(payload: Any) -> str:
    return json.dumps(payload, default=_json_default, ensure_ascii=False)


def project_dir_for(root: Path) -> Path:
    candidate = root / "projects" / "suno-helper"
    return candidate if candidate.exists() else root


# --------------------------------------------------------------------------- #
# the application object
# --------------------------------------------------------------------------- #
@dataclass
class AppConfig:
    root: Path
    host: str = "127.0.0.1"
    port: int = 8787
    token: str = ""
    provider: str | None = None
    allow_network: bool = False
    run_checks: bool = True
    readonly: bool = False
    #: Allow writes without a token when bound to a non-loopback address. Only
    #: correct behind a trusted reverse proxy — see `serve()`'s warning.
    trusted_proxy: bool = False


class AgentApp:
    """The engine plus the bits a browser needs: locks, events, snapshots."""

    def __init__(self, config: AppConfig) -> None:
        self.config = config
        self.root = Path(config.root).resolve()
        self.project = project_dir_for(self.root)
        self.started_at = time.time()
        self._engine: Engine | None = None
        self._engine_lock = threading.Lock()
        self._run_lock = threading.Lock()
        self._running = False
        self._stop = threading.Event()
        self._turn_log: list[dict[str, Any]] = []
        self._turn_log_lock = threading.Lock()
        needs_token = not is_loopback(config.host) and not config.trusted_proxy
        self.token = config.token or (secrets.token_urlsafe(12) if needs_token else "")

    # ------------------------------------------------------------------ engine
    @property
    def engine(self) -> Engine:
        with self._engine_lock:
            if self._engine is None:
                from .providers import build_provider

                engine = Engine(
                    self.root,
                    project_dir=self.project,
                    provider=build_provider(self.config.provider),
                    allow_network=self.config.allow_network,
                    run_checks=self.config.run_checks,
                )
                engine.bootstrap()
                self._engine = engine
            return self._engine

    # ------------------------------------------------------------------- state
    def summary(self) -> dict[str, Any]:
        engine = self.engine
        state = engine.state
        goal = state.goal
        counts = {"open": 0, "done": 0, "blocked": 0, "failed": 0, "pending": 0}
        for sub in state.subgoals:
            key = "open" if sub.is_open() else sub.status
            counts[key] = counts.get(key, 0) + 1
        caps = readiness(self.project)
        return {
            "goal": goal.to_dict(),
            "progress": round(goal.progress() * 100, 1),
            "turn": state.turn,
            "subgoal_counts": counts,
            "subgoals": state.progress_table(),
            "ledger": engine.ledger.stats(window=50),
            "research": {
                "sources": len(engine.research.sources),
                "open_questions": len(engine.research.open_questions(50)),
            },
            "capabilities": {"total": len(CAPABILITIES), "ready": len(caps["ready"]), "missing": len(caps["missing"])},
            "skills": len(engine.skills),
            "crew": engine.crew.stats(),
            "running": self._running,
            "readonly": self.config.readonly,
            "version": VERSION,
            "root": str(self.root),
        }

    def status(self) -> dict[str, Any]:
        engine = self.engine
        return {**self.summary(), "improver": engine.improver.report()}

    def subgoals(self) -> list[dict[str, Any]]:
        return self.engine.state.progress_table()

    def capabilities(self) -> list[dict[str, Any]]:
        ready = set(readiness(self.project)["ready"])
        rows = []
        for cap in CAPABILITIES:
            rows.append(
                {
                    "id": cap.id,
                    "title": cap.title,
                    "phase": cap.phase,
                    "summary": cap.summary,
                    "ready": cap.id in ready,
                    "sources": list(cap.sources),
                    "tests": list(cap.tests),
                    "doc": f"docs/tools/{cap.id}.md",
                }
            )
        return rows

    def skills(self) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        for skill in getattr(self.engine.skills, "skills", {}).values():
            rows.append(
                {
                    "name": getattr(skill, "name", ""),
                    "description": getattr(skill, "description", ""),
                    "path": str(getattr(skill, "path", "")),
                    "tags": list(getattr(skill, "tags", []) or []),
                }
            )
        return sorted(rows, key=lambda row: row["name"])

    def crew(self) -> list[dict[str, Any]]:
        from .crew import ROSTER

        rows = []
        for role_id, role in ROSTER.items():
            rows.append(
                {
                    "id": role_id,
                    "title": getattr(role, "title", role_id),
                    "purpose": getattr(role, "purpose", ""),
                    "skills": list(getattr(role, "skills", []) or []),
                }
            )
        return rows

    def tools(self) -> list[str]:
        return self.engine.tools.names()

    def ledger(self, limit: int = 50) -> list[dict[str, Any]]:
        return self.engine.ledger.tail(max(1, min(limit, 500)))

    # ------------------------------------------------------------------ mutate
    def set_goal(self, payload: dict[str, Any]) -> dict[str, Any]:
        allowed = {key: payload[key] for key in ("title", "statement", "metric", "target") if key in payload}
        if "target" in allowed:
            allowed["target"] = float(allowed["target"])
        goal = self.engine.state.set_goal(**allowed)
        self.engine.state.save(snapshot=True)
        self.engine.write_goal_files()
        return goal.to_dict()

    def add_subgoal(self, payload: dict[str, Any]) -> dict[str, Any]:
        title = str(payload.get("title", "")).strip()
        if not title:
            raise ValueError("a subgoal needs a title")
        acceptance = payload.get("acceptance") or []
        if not isinstance(acceptance, list):
            raise ValueError("acceptance must be a list")
        action = payload.get("action")
        sub = self.engine.state.add_subgoal(
            title=title,
            description=str(payload.get("description", "")),
            priority=int(payload.get("priority", 3)),
            weight=float(payload.get("weight", 1.0)),
            stages=list(payload.get("stages") or ["ultrawork", "verify"]),
            skill_hints=list(payload.get("skill_hints") or []),
            action=action if isinstance(action, dict) else None,
            acceptance=[item for item in acceptance if isinstance(item, dict)],
        )
        self.engine.state.save()
        self.engine.write_goal_files()
        return sub.to_dict()

    def complete_subgoal(self, subgoal_id: str, evidence: str = "") -> dict[str, Any]:
        sub = self.engine.state.complete(subgoal_id, evidence=evidence)
        self.engine.state.recompute_progress()
        self.engine.state.save(snapshot=True)
        self.engine.write_goal_files()
        return sub.to_dict()

    def run_gate(self, tool: str, args: dict[str, Any] | None = None) -> dict[str, Any]:
        started = time.perf_counter()
        result = self.engine.tools.call(tool, **(args or {}))
        return {
            "tool": tool,
            "ok": result.ok,
            "summary": result.summary,
            "error": result.error,
            "details": result.details,
            "duration_ms": int((time.perf_counter() - started) * 1000),
        }

    def turns(self, count: int) -> list[dict[str, Any]]:
        """Run ``count`` cycles and return their results. One runner at a time."""
        count = max(1, min(int(count), MAX_TURN_BATCH))
        if not self._run_lock.acquire(blocking=False):
            raise RuntimeError("a run is already in progress")
        try:
            self._running = True
            self._stop.clear()
            out: list[dict[str, Any]] = []
            for _ in range(count):
                if self._stop.is_set():
                    break
                result = self.engine.cycle()
                out.append(self._result_to_dict(result))
                with self._turn_log_lock:
                    self._turn_log.append(out[-1])
                    del self._turn_log[:-200]
            self.engine.write_goal_files()
            self.engine.state.save(snapshot=True)
            return out
        finally:
            self._running = False
            self._run_lock.release()

    def stream(self, count: int) -> Iterable[dict[str, Any]]:
        """Yield one event per turn. Used by the SSE endpoint; never buffers."""
        count = max(1, min(int(count), MAX_TURN_BATCH))
        if not self._run_lock.acquire(blocking=False):
            yield {"event": "error", "data": {"error": "a run is already in progress"}}
            return
        try:
            self._running = True
            self._stop.clear()
            yield {"event": "start", "data": {"turns": count, "turn": self.engine.state.turn}}
            completed = 0
            for _ in range(count):
                if self._stop.is_set():
                    break
                result = self.engine.cycle()
                payload = self._result_to_dict(result)
                completed += 1
                with self._turn_log_lock:
                    self._turn_log.append(payload)
                    del self._turn_log[:-200]
                goal = self.engine.state.goal
                yield {
                    "event": "turn",
                    "data": {
                        **payload,
                        "goal_current": goal.current,
                        "goal_target": goal.target,
                        "progress": round(goal.progress() * 100, 1),
                    },
                }
            self.engine.write_goal_files()
            self.engine.state.save(snapshot=True)
            goal = self.engine.state.goal
            yield {
                "event": "done",
                "data": {
                    "turns": completed,
                    "stopped": self._stop.is_set(),
                    "goal": goal.to_dict(),
                    "progress": round(goal.progress() * 100, 1),
                },
            }
        finally:
            self._running = False
            self._run_lock.release()

    def stop(self) -> bool:
        was = self._running
        self._stop.set()
        return was

    def export_bundle(self) -> dict[str, Any]:
        bundle = self.engine.state.export_bundle()
        bundle["capabilities"] = self.capabilities()
        bundle["app_version"] = VERSION
        return bundle

    def writes_allowed(self, supplied: str = "") -> bool:
        """Can this caller mutate state? Read-only mode wins, then the token."""
        if self.config.readonly:
            return False
        if not self.token:
            return True
        return secrets.compare_digest(supplied or "", self.token)

    # ------------------------------------------------------------------ helper
    @staticmethod
    def _result_to_dict(result: Any) -> dict[str, Any]:
        return {
            "turn": result.turn,
            "phase": result.phase,
            "stage": getattr(result, "stage", ""),
            "outcome": result.outcome,
            "ok": result.ok,
            "subgoal": result.subgoal_id,
            "tool": result.tool,
            "duration_ms": result.duration_ms,
            "notes": (result.notes or "")[:400],
            "at": time.time(),
        }


# --------------------------------------------------------------------------- #
# HTTP layer
# --------------------------------------------------------------------------- #
SAFE_SEGMENT = re.compile(r"^[A-Za-z0-9._-]+$")


def make_handler(app: AgentApp) -> type[BaseHTTPRequestHandler]:
    class Handler(BaseHTTPRequestHandler):
        server_version = f"SunoHelper/{VERSION}"
        protocol_version = "HTTP/1.1"

        # -- plumbing -----------------------------------------------------
        def log_message(self, fmt: str, *args: Any) -> None:  # quieter than the default
            if os.environ.get("SUNO_HELPER_APP_VERBOSE"):
                super().log_message(fmt, *args)

        def _send_json(self, payload: Any, status: int = 200) -> None:
            body = dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def _send_text(self, text: str, status: int = 200, content_type: str = "text/plain; charset=utf-8") -> None:
            body = text.encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def _error(self, status: int, message: str) -> None:
            self._send_json({"ok": False, "error": message}, status=status)

        def _read_json(self) -> dict[str, Any]:
            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0:
                return {}
            if length > 1_000_000:
                raise ValueError("request body too large")
            raw = self.rfile.read(length)
            try:
                data = json.loads(raw.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise ValueError(f"invalid JSON: {exc}") from exc
            if not isinstance(data, dict):
                raise ValueError("expected a JSON object")
            return data

        def _writes_allowed(self) -> bool:
            """Reads are open; writes need a token once the bind is not loopback."""
            supplied = self.headers.get("X-Suno-Helper-Token") or ""
            if not supplied:
                query = urllib.parse.parse_qs(urllib.parse.urlsplit(self.path).query)
                supplied = (query.get("token") or [""])[0]
            return app.writes_allowed(supplied)

        def _guard_write(self) -> bool:
            if not self._writes_allowed():
                self._error(HTTPStatus.FORBIDDEN, "this endpoint needs the app token" if app.token else "read-only mode")
                return False
            content_type = (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()
            if content_type and content_type != "application/json":
                self._error(HTTPStatus.UNSUPPORTED_MEDIA_TYPE, "send application/json")
                return False
            # A custom header cannot be set cross-origin without a preflight, so
            # its presence is our CSRF check for the no-token loopback case.
            if not self.headers.get("X-Suno-Helper"):
                self._error(HTTPStatus.FORBIDDEN, "missing X-Suno-Helper header")
                return False
            return True

        # -- verbs --------------------------------------------------------
        def do_GET(self) -> None:  # noqa: N802 - http.server API
            parts = urllib.parse.urlsplit(self.path)
            path = urllib.parse.unquote(parts.path)
            query = urllib.parse.parse_qs(parts.query)

            try:
                if path == "/" or path == "/index.html":
                    return self._serve_static("index.html")
                if path.startswith("/assets/"):
                    return self._serve_static(path[len("/assets/") :])
                if path == "/api/health":
                    return self._send_json(
                        {
                            "ok": True,
                            "version": VERSION,
                            "root": str(app.root),
                            "uptime_s": round(time.time() - app.started_at, 1),
                            "running": app._running,
                            "writable": not app.config.readonly,
                            "token_required": bool(app.token),
                        }
                    )
                if path == "/api/state":
                    return self._send_json({"ok": True, "data": app.status()})
                if path == "/api/subgoals":
                    return self._send_json({"ok": True, "data": app.subgoals()})
                if path == "/api/capabilities":
                    return self._send_json({"ok": True, "data": app.capabilities()})
                if path == "/api/skills":
                    return self._send_json({"ok": True, "data": app.skills()})
                if path == "/api/crew":
                    return self._send_json({"ok": True, "data": app.crew()})
                if path == "/api/tools":
                    return self._send_json({"ok": True, "data": app.tools()})
                if path == "/api/ledger":
                    limit = int((query.get("limit") or ["50"])[0])
                    return self._send_json({"ok": True, "data": app.ledger(limit)})
                if path == "/api/export":
                    return self._send_json({"ok": True, "data": app.export_bundle()})
                if path == "/api/stream":
                    turns = int((query.get("turns") or ["10"])[0])
                    return self._stream(turns)
                return self._error(HTTPStatus.NOT_FOUND, f"no route: {path}")
            except KeyError as exc:
                # An unknown subgoal id is the caller's mistake, not a server fault.
                return self._error(HTTPStatus.NOT_FOUND, str(exc).strip("'\""))
            except (ValueError, RuntimeError) as exc:
                return self._error(HTTPStatus.BAD_REQUEST, str(exc))
            except BrokenPipeError:
                return None
            except Exception as exc:  # pragma: no cover - defensive
                return self._error(HTTPStatus.INTERNAL_SERVER_ERROR, f"{type(exc).__name__}: {exc}")

        def do_POST(self) -> None:  # noqa: N802
            path = urllib.parse.urlsplit(self.path).path
            if not self._guard_write():
                return
            try:
                payload = self._read_json()
                if path == "/api/goal":
                    return self._send_json({"ok": True, "data": app.set_goal(payload)})
                if path == "/api/subgoal":
                    return self._send_json({"ok": True, "data": app.add_subgoal(payload)}, status=201)
                if path == "/api/subgoal/complete":
                    subgoal_id = str(payload.get("id", "")).strip()
                    if not subgoal_id:
                        return self._error(HTTPStatus.BAD_REQUEST, "missing id")
                    return self._send_json(
                        {"ok": True, "data": app.complete_subgoal(subgoal_id, evidence=str(payload.get("evidence", "")))}
                    )
                if path == "/api/gate":
                    tool = str(payload.get("tool", "")).strip()
                    if not tool:
                        return self._error(HTTPStatus.BAD_REQUEST, "missing tool")
                    return self._send_json({"ok": True, "data": app.run_gate(tool, payload.get("args") or {})})
                if path == "/api/turn":
                    turns = payload.get("turns", 1)
                    return self._send_json({"ok": True, "data": {"results": app.turns(int(turns))}})
                if path == "/api/stop":
                    return self._send_json({"ok": True, "data": {"stopped": app.stop()}})
                return self._error(HTTPStatus.NOT_FOUND, f"no route: {path}")
            except KeyError as exc:
                return self._error(HTTPStatus.NOT_FOUND, str(exc).strip("'\""))
            except (ValueError, RuntimeError) as exc:
                return self._error(HTTPStatus.BAD_REQUEST, str(exc))
            except BrokenPipeError:
                return None
            except Exception as exc:  # pragma: no cover
                return self._error(HTTPStatus.INTERNAL_SERVER_ERROR, f"{type(exc).__name__}: {exc}")

        # -- static -------------------------------------------------------
        def _serve_static(self, name: str) -> None:
            if not SAFE_SEGMENT.match(name):
                return self._error(HTTPStatus.BAD_REQUEST, "bad asset name")
            path = WEBAPP_DIR / name
            if not path.is_file():
                return self._error(HTTPStatus.NOT_FOUND, f"missing asset: {name}")
            body = path.read_bytes()
            content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
            if content_type.startswith("text/") or content_type in {"application/javascript", "application/json"}:
                content_type += "; charset=utf-8"
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(body)

        # -- SSE ----------------------------------------------------------
        def _stream(self, turns: int) -> None:
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Connection", "close")
            self.send_header("X-Accel-Buffering", "no")
            self.end_headers()
            self.close_connection = True
            try:
                for event in app.stream(turns):
                    chunk = f"event: {event['event']}\ndata: {dumps(event['data'])}\n\n"
                    self.wfile.write(chunk.encode("utf-8"))
                    self.wfile.flush()
            except (BrokenPipeError, ConnectionResetError):
                app.stop()
                return

    return Handler


@dataclass
class RunningApp:
    server: ThreadingHTTPServer
    app: AgentApp
    thread: threading.Thread | None = None
    url: str = ""

    def stop(self) -> None:
        # `shutdown()` blocks until `serve_forever()` returns, so calling it on a
        # server that was never started hangs forever. Do it in a thread and let
        # the join time out.
        shutdown = threading.Thread(target=self.server.shutdown, daemon=True)
        shutdown.start()
        shutdown.join(timeout=5)
        self.server.server_close()

    def serve_forever(self) -> None:  # pragma: no cover - blocks
        self.server.serve_forever(poll_interval=0.2)


def create_app(
    root: Path,
    *,
    host: str = "127.0.0.1",
    port: int = 8787,
    token: str = "",
    provider: str | None = None,
    allow_network: bool = False,
    run_checks: bool = True,
    readonly: bool = False,
    trusted_proxy: bool = False,
) -> RunningApp:
    config = AppConfig(
        root=Path(root),
        host=host,
        port=port,
        token=token,
        provider=provider,
        allow_network=allow_network,
        run_checks=run_checks,
        readonly=readonly,
        trusted_proxy=trusted_proxy,
    )
    app = AgentApp(config)
    handler = make_handler(app)
    server = ThreadingHTTPServer((host, port), handler)
    server.daemon_threads = True
    actual_port = server.server_address[1]
    display_host = "127.0.0.1" if host in {"0.0.0.0", "::"} else host
    return RunningApp(server=server, app=app, url=f"http://{display_host}:{actual_port}/")


def serve(
    root: Path,
    *,
    host: str = "127.0.0.1",
    port: int = 8787,
    token: str = "",
    provider: str | None = None,
    allow_network: bool = False,
    run_checks: bool = True,
    readonly: bool = False,
    trusted_proxy: bool = False,
) -> None:  # pragma: no cover - the interactive path
    running = create_app(
        root,
        host=host,
        port=port,
        token=token,
        provider=provider,
        allow_network=allow_network,
        run_checks=run_checks,
        readonly=readonly,
        trusted_proxy=trusted_proxy,
    )
    app = running.app
    print(f"suno helper app  ·  {running.url}")
    print(f"root             ·  {app.root}")
    print(f"mode             ·  {'read-only' if readonly else 'read + write'}")
    if app.token:
        print(f"write token      ·  {app.token}")
        print("                     (send as X-Suno-Helper-Token; reads need nothing)")
    if not is_loopback(host) and trusted_proxy:
        print("warning          ·  --trusted-proxy: writes need no token on this bind.")
        print("                     Only correct when something you trust sits in front of")
        print("                     this port. Cross-origin writes are still refused.")
    elif not is_loopback(host):
        print("warning          ·  bound to a non-loopback address; writes need the token above")
    print("ctrl-c to stop")
    try:
        running.serve_forever()
    except KeyboardInterrupt:
        print("\nstopping")
    finally:
        running.stop()
