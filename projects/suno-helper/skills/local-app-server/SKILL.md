---
name: local-app-server
description: Use when adding a local web surface to a CLI tool - covers the six decisions that bite (bind address, tokens, CSRF, streaming, static assets offline, shutdown) and the tests that catch each one without a browser
tags: [app, server, security, ui, offline, sse]
stages: [ultraplan, ultrawork, verify]
---

# Serving a local app from a CLI tool

A dashboard is the cheapest way to make a loop legible, and the fastest way to
introduce a security bug into a project whose whole premise is "nothing leaves
your machine". This is the checklist.

## The six decisions

| Decision | Default | Why it is the default | Test that catches it |
|---|---|---|---|
| **Bind address** | `127.0.0.1` | A tool that binds `0.0.0.0` by accident is a tool other people can reach | assert `is_loopback(host)` gates token generation |
| **Writes need auth** | token when bind is non-loopback | reads are public information; writes are a capability | write without token → 403 |
| **CSRF** | require a custom request header | cross-origin JS cannot set `X-…` without a preflight you do not answer | write without header → 403 |
| **Streaming** | SSE, one event per unit of work | polling a 30 s turn is 30 requests that show nothing | assert `text/event-stream` and event order |
| **Assets** | shipped in the package, no CDN | "works offline" is a promise, not a preference | grep the HTML/JS/CSS for `https://` |
| **Shutdown** | never block forever | `server.shutdown()` on a server that never started hangs | construct without starting, then stop |

## The traps

**`shutdown()` deadlocks.** `BaseServer.shutdown()` waits for `serve_forever()`
to return. If the loop never started — a test that only constructs the server,
or a bind error path — the call blocks forever and the test suite hangs rather
than fails. Run it in a thread and `join(timeout=…)`.

**A `KeyError` is not a `ValueError`.** Router `except (ValueError, RuntimeError)`
turns "no such subgoal" into a 500 and blames the server for the caller's typo.
Map `KeyError` → 404 explicitly.

**Grep-based security tests match the comment that forbids the thing.** A test
asserting the manifest contains no `<all_urls>` failed on the line saying "no
`<all_urls>`". Parse the array, then assert on its members.

**Tokens on a proxied preview.** Requiring a token on a non-loopback bind is
right, and it also makes a proxied preview unusable. The honest escape hatch is
an explicit `--trusted-proxy` flag that drops the token but *keeps* the CSRF
header, prints a warning, and names what it assumes. Never flip that default
silently to make a demo work.

**A form that re-renders while you type.** Polling every 15 s is fine until it
overwrites the goal field mid-edit. Check `document.activeElement` before
writing server values back into inputs.

## No browser in CI? Test the wiring statically

You cannot screenshot, but every real bug in a hand-written dashboard is one of
four kinds, and all four are greppable:

- an id the script looks up that the markup never defines
- a nav item with no panel, or a panel with no nav item
- a panel missing from the router
- a style class used in markup and absent from the stylesheet

Seven string checks replace a smoke test. They have already caught a typo here
that no amount of reading would have.

## Serving the loop itself

If the tool already writes state to disk (`goal.json`, a ledger), the dashboard
has no business inventing its own store: read the same files through the same
objects the CLI uses, and let the CLI and the app be two views of one engine.
Two writers to one state directory is how the numbers on screen stop matching
the numbers in the log.
