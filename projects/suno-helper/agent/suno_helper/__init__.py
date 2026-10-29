"""Suno Helper — autonomous, local-first agent loop for the Suno knowledge base.

The package implements the `/loop` operating model:

    goal  ->  subgoals  ->  skills  ->  research  ->  work  ->  verify  ->  improve

Every turn reads the current ``/goal`` and ``/subgoals``, picks one subgoal,
finds the skills that apply to it, optionally researches, performs real tool
work, verifies the result, and then writes the updated goal/subgoals back to
disk together with an append-only ledger entry.

Nothing in this package requires a network connection or an API key: the
default provider is a deterministic local heuristic. Remote providers
(OpenAI-compatible, Ollama, Anthropic) are opt-in via environment variables.
"""

from __future__ import annotations

__version__ = "0.1.0"

__all__ = ["__version__"]
