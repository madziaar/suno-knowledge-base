"""Filesystem helpers: atomic writes, locking, workspace path containment."""

from __future__ import annotations

import contextlib
import json
import os
import tempfile
import time
from pathlib import Path
from typing import Any, Iterator


class PathEscapeError(ValueError):
    """Raised when a requested path would resolve outside the workspace root."""


def atomic_write_text(path: Path, text: str, *, encoding: str = "utf-8") -> None:
    """Write *text* to *path* atomically (temp file in same dir + os.replace)."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding=encoding, newline="\n") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp, path)
    finally:
        with contextlib.suppress(FileNotFoundError):
            os.unlink(tmp)


def atomic_write_json(path: Path, data: Any, *, indent: int = 2) -> None:
    """Serialize *data* as JSON and write it atomically."""
    atomic_write_text(path, json.dumps(data, indent=indent, ensure_ascii=False) + "\n")


def read_json(path: Path, default: Any = None) -> Any:
    """Read JSON from *path*, returning *default* when the file is missing/corrupt."""
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return default


def resolve_inside(root: Path, candidate: str | Path) -> Path:
    """Resolve *candidate* and assert it stays inside *root*.

    Guards every tool that touches the filesystem so a subgoal cannot be used
    to read or write outside the project root.
    """
    root = Path(root).resolve()
    target = (root / candidate).resolve() if not Path(candidate).is_absolute() else Path(candidate).resolve()
    if target != root and root not in target.parents:
        raise PathEscapeError(f"refusing to touch path outside workspace: {candidate}")
    return target


class FileLock:
    """Best-effort advisory lock so two `/loop` processes never interleave."""

    def __init__(self, path: Path, *, stale_after: float = 3600.0) -> None:
        self.path = Path(path)
        self.stale_after = stale_after
        self._acquired = False

    def acquire(self) -> bool:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self.path.exists() and self._is_stale():
            with contextlib.suppress(OSError):
                self.path.unlink()
        try:
            fd = os.open(self.path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o644)
        except FileExistsError:
            return False
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(json.dumps({"pid": os.getpid(), "ts": time.time()}))
        self._acquired = True
        return True

    def _is_stale(self) -> bool:
        try:
            age = time.time() - self.path.stat().st_mtime
            payload = read_json(self.path, {}) or {}
            pid = payload.get("pid")
            if isinstance(pid, int) and pid > 0:
                with contextlib.suppress(OSError):
                    os.kill(pid, 0)
                    return False
            return age > self.stale_after
        except OSError:
            return True

    def release(self) -> None:
        if self._acquired:
            with contextlib.suppress(FileNotFoundError):
                self.path.unlink()
            self._acquired = False

    def __enter__(self) -> "FileLock":
        if not self.acquire():
            raise RuntimeError(f"another loop holds the lock: {self.path}")
        return self

    def __exit__(self, *exc: object) -> None:
        self.release()


@contextlib.contextmanager
def maybe_lock(path: Path, enabled: bool = True) -> Iterator[bool]:
    """Acquire a lock when *enabled*, yielding whether the lock was taken."""
    if not enabled:
        yield True
        return
    lock = FileLock(path)
    if not lock.acquire():
        yield False
        return
    try:
        yield True
    finally:
        lock.release()
