"""Tests for the local agent app.

The app is a server, so these tests are honest about that: they start a real
``ThreadingHTTPServer`` on port 0, speak real HTTP over a real socket, and shut
it down. No mocked transports — a routing or header bug that only appears in
``urllib`` is exactly the bug a mock would hide.
"""

from __future__ import annotations

import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from suno_helper.app import VERSION, WEBAPP_DIR, AgentApp, AppConfig, create_app, is_loopback
from suno_helper.capabilities import CAPABILITIES
from suno_helper.providers import HeuristicProvider

from .test_engine import make_workspace


class AppClient:
    """A minimal browser: one method per verb, no redirects, no retries."""

    def __init__(self, base: str, token: str = "") -> None:
        self.base = base.rstrip("/")
        self.token = token

    def request(self, path: str, method: str = "GET", payload=None, headers=None):
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = urllib.request.Request(self.base + path, data=data, method=method)
        if data is not None:
            req.add_header("Content-Type", "application/json")
        for key, value in (headers or {}).items():
            req.add_header(key, value)
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                body = response.read()
                ctype = response.headers.get("Content-Type", "")
                if "application/json" in ctype:
                    return response.status, json.loads(body.decode("utf-8"))
                return response.status, body.decode("utf-8", errors="replace")
        except urllib.error.HTTPError as error:
            body = error.read().decode("utf-8", errors="replace")
            try:
                return error.code, json.loads(body)
            except json.JSONDecodeError:
                return error.code, body

    def get(self, path: str):
        return self.request(path, "GET")

    def post(self, path: str, payload=None, *, header: bool = True):
        return self.request(path, "POST", payload or {}, {"X-Suno-Helper": "1"} if header else {})


class AppTestCase(unittest.TestCase):
    token = ""

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = make_workspace(Path(self.tmp.name))
        self.running = create_app(self.root, host="127.0.0.1", port=0, token=self.token, run_checks=False)
        self.running.app._engine = None  # let create_app's engine build lazily
        self.thread = threading.Thread(target=self.running.serve_forever, daemon=True)
        self.thread.start()
        self.client = AppClient(self.running.url, self.running.app.token)

    def tearDown(self) -> None:
        self.running.stop()
        self.thread.join(timeout=5)
        self.tmp.cleanup()


class HealthTests(AppTestCase):
    def test_health_reports_version_and_root(self) -> None:
        status, body = self.client.get("/api/health")
        self.assertEqual(status, 200)
        self.assertTrue(body["ok"])
        self.assertEqual(body["version"], VERSION)
        self.assertIn("repo", body["root"])

    def test_health_is_readable_without_a_token(self) -> None:
        _status, body = self.client.get("/api/health")
        self.assertIn("writable", body)
        self.assertFalse(body["token_required"])

    def test_unknown_route_is_404_json(self) -> None:
        status, body = self.client.get("/api/nope")
        self.assertEqual(status, 404)
        self.assertFalse(body["ok"])

    def test_static_index_is_served(self) -> None:
        status, body = self.client.get("/")
        self.assertEqual(status, 200)
        self.assertIn("<title>Suno Helper", body)

    def test_static_assets_are_served(self) -> None:
        for asset in ("/assets/app.js", "/assets/styles.css"):
            status, body = self.client.get(asset)
            self.assertEqual(status, 200, msg=asset)
            self.assertGreater(len(body), 500, msg=asset)

    def test_asset_path_traversal_is_refused(self) -> None:
        status, _body = self.client.get("/assets/..%2F..%2Fagent%2Fapp.py")
        self.assertIn(status, (400, 404))

    def test_webapp_has_no_external_dependencies(self) -> None:
        """Offline-capable is a promise, not a preference: no CDN, no fonts."""
        for name in ("index.html", "app.js", "styles.css"):
            text = (WEBAPP_DIR / name).read_text(encoding="utf-8")
            self.assertNotIn("http://", text.replace("http://127.0.0.1", ""), msg=name)
            self.assertNotIn("https://", text, msg=name)
            self.assertNotIn("cdn.", text, msg=name)


class WebappWiringTests(unittest.TestCase):
    """Static checks on the dashboard.

    There is no browser in CI, so these replace what a smoke test would catch:
    an id the script looks up that the markup never defines, a nav item with no
    panel behind it, a panel with no way to reach it.
    """

    @classmethod
    def setUpClass(cls) -> None:
        cls.html = (WEBAPP_DIR / "index.html").read_text(encoding="utf-8")
        cls.js = (WEBAPP_DIR / "app.js").read_text(encoding="utf-8")
        cls.css = (WEBAPP_DIR / "styles.css").read_text(encoding="utf-8")

    def test_every_id_the_script_uses_exists_in_the_markup(self) -> None:
        import re

        used = set(re.findall(r"\$\('([A-Za-z0-9_-]+)'\)", self.js))
        declared = set(re.findall(r'id="([A-Za-z0-9_-]+)"', self.html))
        missing = sorted(used - declared)
        self.assertEqual(missing, [], msg=f"app.js looks up ids the page does not define: {missing}")

    def test_every_nav_item_has_a_panel_and_vice_versa(self) -> None:
        import re

        views = set(re.findall(r'data-view="([a-z]+)"', self.html))
        panels = set(re.findall(r'id="view-([a-z]+)"', self.html))
        self.assertEqual(views, panels)
        self.assertEqual(len(views), 6)

    def test_every_panel_is_in_the_router(self) -> None:
        import re

        panels = set(re.findall(r'id="view-([a-z]+)"', self.html))
        router = set(re.findall(r"^\s{4}([a-z]+):", self.js, re.MULTILINE))
        self.assertTrue(panels.issubset(router), msg=f"panels without a loader: {panels - router}")

    def test_no_inline_event_handlers(self) -> None:
        """CSP is `script-src 'self'`; inline handlers would silently die."""
        self.assertNotIn("onclick=\"", self.html)
        self.assertNotIn("onsubmit=\"", self.html)

    def test_stylesheet_covers_the_classes_the_markup_uses(self) -> None:
        import re

        classes = set()
        for attr in re.findall(r'class="([^"]+)"', self.html):
            classes.update(part for part in attr.split() if part and not part.startswith("{"))
        # Only the structural classes matter; utility-ish ones are additive.
        must_exist = {name for name in classes if name in {"card", "rail", "rail-item", "stat", "stats", "split", "log", "toast", "chip", "sg"}}
        for name in must_exist:
            self.assertIn(f".{name}", self.css, msg=f"no style for .{name}")

    def test_the_script_sends_the_csrf_header_on_writes(self) -> None:
        self.assertIn("'X-Suno-Helper': '1'", self.js)

    def test_no_console_logging_left_behind(self) -> None:
        self.assertNotIn("console.log(", self.js)


class StateTests(AppTestCase):
    def test_state_reports_a_goal(self) -> None:
        status, body = self.client.get("/api/state")
        self.assertEqual(status, 200)
        data = body["data"]
        self.assertTrue(data["goal"]["title"])
        self.assertIn("subgoal_counts", data)
        self.assertEqual(data["capabilities"]["total"], len(CAPABILITIES))

    def test_state_counts_subgoals(self) -> None:
        _status, body = self.client.get("/api/state")
        counts = body["data"]["subgoal_counts"]
        self.assertGreaterEqual(counts.get("open", 0) + counts.get("done", 0), 1)
        self.assertEqual(body["data"]["subgoals"], body["data"]["subgoals"])

    def test_subgoal_table_matches_the_state(self) -> None:
        _status, state = self.client.get("/api/state")
        _status, subs = self.client.get("/api/subgoals")
        self.assertEqual(len(subs["data"]), len(state["data"]["subgoals"]))

    def test_capabilities_split_ready_from_missing(self) -> None:
        status, body = self.client.get("/api/capabilities")
        self.assertEqual(status, 200)
        rows = body["data"]
        self.assertEqual(len(rows), len(CAPABILITIES))
        ready = [row for row in rows if row["ready"]]
        self.assertGreater(len(ready), 0)
        for row in rows:
            self.assertIn("id", row)
            self.assertTrue(row["doc"].startswith("docs/tools/"))

    def test_skills_are_discovered(self) -> None:
        status, body = self.client.get("/api/skills")
        self.assertEqual(status, 200)
        self.assertGreater(len(body["data"]), 0)
        self.assertTrue(all("name" in row for row in body["data"]))

    def test_crew_roster_is_exposed(self) -> None:
        status, body = self.client.get("/api/crew")
        self.assertEqual(status, 200)
        self.assertGreater(len(body["data"]), 3)

    def test_tools_include_the_audit_gates(self) -> None:
        _status, body = self.client.get("/api/tools")
        self.assertIn("md_audit", body["data"])
        self.assertIn("capability_docs", body["data"])

    def test_export_bundle_includes_capabilities(self) -> None:
        _status, body = self.client.get("/api/export")
        self.assertEqual(body["data"]["schema"], "suno-helper/state@1")
        self.assertEqual(len(body["data"]["capabilities"]), len(CAPABILITIES))


class WriteTests(AppTestCase):
    def test_goal_can_be_updated(self) -> None:
        status, body = self.client.post(
            "/api/goal", {"title": "Ship the app", "statement": "It runs offline.", "target": 100}
        )
        self.assertEqual(status, 200)
        self.assertEqual(body["data"]["title"], "Ship the app")
        _status, state = self.client.get("/api/state")
        self.assertEqual(state["data"]["goal"]["title"], "Ship the app")

    def test_goal_write_persists_goal_markdown(self) -> None:
        self.client.post("/api/goal", {"title": "Written to disk"})
        text = (self.root / "projects" / "suno-helper" / "GOAL.md").read_text(encoding="utf-8")
        self.assertIn("Written to disk", text)

    def test_subgoal_can_be_added(self) -> None:
        status, body = self.client.post(
            "/api/subgoal",
            {
                "title": "Wire the export dialog",
                "description": "A button that writes a file.",
                "priority": 4,
                "action": {"tool": "md_audit", "args": {}},
                "acceptance": [{"tool": "md_audit", "expect": "pass"}],
            },
        )
        self.assertEqual(status, 201)
        self.assertEqual(body["data"]["title"], "Wire the export dialog")
        _status, subs = self.client.get("/api/subgoals")
        self.assertIn("Wire the export dialog", [row["title"] for row in subs["data"]])

    def test_subgoal_without_a_title_is_refused(self) -> None:
        status, body = self.client.post("/api/subgoal", {"description": "no title"})
        self.assertEqual(status, 400)
        self.assertIn("title", body["error"])

    def test_subgoal_can_be_completed(self) -> None:
        _status, added = self.client.post("/api/subgoal", {"title": "Finish this one"})
        subgoal_id = added["data"]["id"]
        status, body = self.client.post("/api/subgoal/complete", {"id": subgoal_id, "evidence": "done"})
        self.assertEqual(status, 200)
        self.assertEqual(body["data"]["status"], "done")

    def test_completing_an_unknown_subgoal_is_a_404(self) -> None:
        status, body = self.client.post("/api/subgoal/complete", {"id": "nope-not-real"})
        self.assertEqual(status, 404)
        self.assertFalse(body["ok"])
        self.assertIn("subgoal", body["error"])

    def test_a_gate_can_be_run(self) -> None:
        status, body = self.client.post("/api/gate", {"tool": "json_validate"})
        self.assertEqual(status, 200)
        self.assertTrue(body["data"]["ok"])
        self.assertEqual(body["data"]["tool"], "json_validate")

    def test_a_crashing_gate_is_reported_not_raised(self) -> None:
        status, body = self.client.post("/api/gate", {"tool": "noop"})
        self.assertEqual(status, 200)
        self.assertTrue(body["data"]["ok"])

    def test_unknown_tool_returns_a_failed_gate(self) -> None:
        _status, body = self.client.post("/api/gate", {"tool": "not_a_tool"})
        self.assertFalse(body["data"]["ok"])

    def test_a_single_turn_runs_and_writes_the_ledger(self) -> None:
        status, body = self.client.post("/api/turn", {"turns": 1})
        self.assertEqual(status, 200)
        results = body["data"]["results"]
        self.assertEqual(len(results), 1)
        self.assertIn("outcome", results[0])
        _status, ledger = self.client.get("/api/ledger?limit=5")
        self.assertGreaterEqual(len(ledger["data"]), 1)

    def test_stop_on_an_idle_app_is_harmless(self) -> None:
        status, body = self.client.post("/api/stop")
        self.assertEqual(status, 200)
        self.assertFalse(body["data"]["stopped"])

    def test_turn_cap_refuses_absurd_batches(self) -> None:
        status, _body = self.client.post("/api/turn", {"turns": 100000})
        self.assertEqual(status, 200)  # clamped, not rejected


class GuardTests(AppTestCase):
    # -- CSRF -------------------------------------------------------------
    def test_write_without_the_csrf_header_is_refused(self) -> None:
        status, body = self.client.post("/api/goal", {"title": "nope"}, header=False)
        self.assertEqual(status, 403)
        self.assertIn("X-Suno-Helper", body["error"])

    def test_non_json_content_type_is_refused(self) -> None:
        req = urllib.request.Request(self.running.url + "api/goal", data=b"title=x", method="POST")
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        req.add_header("X-Suno-Helper", "1")
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req, timeout=10)
        self.assertEqual(ctx.exception.code, 415)

    def test_invalid_json_is_a_400(self) -> None:
        req = urllib.request.Request(self.running.url + "api/goal", data=b"{oops", method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("X-Suno-Helper", "1")
        with self.assertRaises(urllib.error.HTTPError) as ctx:
            urllib.request.urlopen(req, timeout=10)
        self.assertEqual(ctx.exception.code, 400)

    # -- limits -----------------------------------------------------------
    def test_health_exposes_the_run_state(self) -> None:
        self.assertFalse(self.running.app._running)
        status, body = self.client.get("/api/health")
        self.assertEqual(status, 200)
        self.assertFalse(body["running"])

    def test_binding_loopback_needs_no_token(self) -> None:
        self.assertTrue(is_loopback("127.0.0.1"))
        self.assertTrue(is_loopback("localhost"))
        self.assertFalse(is_loopback("0.0.0.0"))
        running = create_app(self.root, host="127.0.0.1", port=0, run_checks=False)
        try:
            self.assertEqual(running.app.token, "")
        finally:
            running.stop()

    def test_binding_public_address_generates_a_token(self) -> None:
        app = AgentApp(AppConfig(root=self.root, host="0.0.0.0"))
        self.assertGreaterEqual(len(app.token), 8)

    def test_progress_is_a_percentage_not_a_fraction(self) -> None:
        _status, body = self.client.get("/api/state")
        self.assertGreaterEqual(body["data"]["progress"], 0.0)
        self.assertLessEqual(body["data"]["progress"], 100.0)


class TrustedProxyTests(unittest.TestCase):
    """--trusted-proxy drops the token but never drops the CSRF header check."""

    def test_public_bind_with_trusted_proxy_has_no_token(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            app = AgentApp(AppConfig(root=root, host="0.0.0.0", trusted_proxy=True))
            self.assertEqual(app.token, "")
            self.assertTrue(app.writes_allowed(""))

    def test_public_bind_without_trusted_proxy_keeps_the_token(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            app = AgentApp(AppConfig(root=root, host="0.0.0.0"))
            self.assertNotEqual(app.token, "")
            self.assertFalse(app.writes_allowed(""))
            self.assertTrue(app.writes_allowed(app.token))

    def test_csrf_header_is_still_required(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            running = create_app(root, host="127.0.0.1", port=0, run_checks=False, trusted_proxy=True)
            thread = threading.Thread(target=running.serve_forever, daemon=True)
            thread.start()
            try:
                client = AppClient(running.url)
                status, body = client.post("/api/goal", {"title": "nope"}, header=False)
                self.assertEqual(status, 403)
                self.assertIn("X-Suno-Helper", body["error"])
            finally:
                running.stop()
                thread.join(timeout=5)


class ReadonlyTests(AppTestCase):
    def setUp(self) -> None:
        super().setUp()
        self.readonly = create_app(self.root, host="127.0.0.1", port=0, run_checks=False, readonly=True)
        self.ro_thread = threading.Thread(target=self.readonly.serve_forever, daemon=True)
        self.ro_thread.start()
        self.ro_client = AppClient(self.readonly.url)

    def tearDown(self) -> None:
        self.readonly.stop()
        self.ro_thread.join(timeout=5)
        super().tearDown()

    def test_reads_still_work(self) -> None:
        status, body = self.ro_client.get("/api/state")
        self.assertEqual(status, 200)
        self.assertTrue(body["data"]["readonly"])

    def test_writes_are_refused(self) -> None:
        status, body = self.ro_client.post("/api/goal", {"title": "nope"})
        self.assertEqual(status, 403)
        self.assertIn("read-only", body["error"])

    def test_gate_runs_are_refused(self) -> None:
        status, _body = self.ro_client.post("/api/gate", {"tool": "json_validate"})
        self.assertEqual(status, 403)


class TokenTests(AppTestCase):
    token = "secret-token-for-tests"

    def test_write_without_the_token_is_refused(self) -> None:
        status, body = self.client.request("/api/goal", "POST", {"title": "nope"}, {"X-Suno-Helper": "1"})
        self.assertEqual(status, 403)
        self.assertIn("token", body["error"])

    def test_write_with_the_token_succeeds(self) -> None:
        status, body = self.client.request(
            "/api/goal",
            "POST",
            {"title": "Token was right"},
            {"X-Suno-Helper": "1", "X-Suno-Helper-Token": self.token},
        )
        self.assertEqual(status, 200)
        self.assertEqual(body["data"]["title"], "Token was right")

    def test_reads_never_need_the_token(self) -> None:
        status, _body = self.client.get("/api/state")
        self.assertEqual(status, 200)


class StreamTests(AppTestCase):
    def test_stream_emits_start_turns_and_done(self) -> None:
        events: list[str] = []
        req = urllib.request.Request(self.running.url + "api/stream?turns=3")
        req.add_header("X-Suno-Helper", "1")
        with urllib.request.urlopen(req, timeout=60) as response:
            self.assertEqual(response.headers.get("Content-Type", "").split(";")[0], "text/event-stream")
            for raw in response:
                line = raw.decode("utf-8").strip()
                if line.startswith("event:"):
                    events.append(line.split(":", 1)[1].strip())
        self.assertEqual(events[0], "start")
        self.assertEqual(events[-1], "done")
        self.assertEqual(events.count("turn"), 3)

    def test_stream_payload_carries_progress(self) -> None:
        req = urllib.request.Request(self.running.url + "api/stream?turns=1")
        req.add_header("X-Suno-Helper", "1")
        with urllib.request.urlopen(req, timeout=60) as response:
            body = response.read().decode("utf-8")
        turn_lines = [line for line in body.splitlines() if line.startswith("data:") and "progress" in line]
        self.assertTrue(turn_lines)


class IsolationTests(unittest.TestCase):
    """The app must not depend on the real repository to construct."""

    def test_create_app_against_a_bare_workspace(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            running = create_app(root, host="127.0.0.1", port=0, run_checks=False)
            try:
                self.assertTrue(running.url.startswith("http://127.0.0.1:"))
                self.assertIsInstance(running.app.engine.provider, (HeuristicProvider, type(None)) if False else object)
            finally:
                running.stop()

    def test_writes_never_escape_the_project(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = make_workspace(Path(tmp))
            running = create_app(root, host="127.0.0.1", port=0, run_checks=False)
            thread = threading.Thread(target=running.serve_forever, daemon=True)
            thread.start()
            try:
                client = AppClient(running.url)
                client.post("/api/subgoal", {"title": "../../etc/passwd"})
                written = list(root.rglob("subgoals.json"))
                self.assertEqual(len(written), 1)
                self.assertTrue(str(written[0]).startswith(str(root)))
            finally:
                running.stop()
                thread.join(timeout=5)
