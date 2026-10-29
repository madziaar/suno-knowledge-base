---
description: Inspect or adjust the /subgoals work queue
argument-hint: "[list|add|update|done|drop|block] ..."
allowed-tools: Bash(python3:*), Read, Write
---

# /subgoals

Subgoals are atomic, verifiable units of work. The definition is strict:

```json
{
  "id": "canonical-limits",
  "title": "Canonical Suno limits table",
  "status": "pending",
  "priority": 5,
  "weight": 2.0,
  "depends_on": [],
  "stages": ["ultraresearch", "ultrawork", "verify"],
  "skill_hints": ["suno-prompt-engineering"],
  "action": {"tool": "limits_audit", "args": {}},
  "acceptance": [{"tool": "limits_audit", "expect": "pass"}]
}
```

No `action` and no `acceptance` means it is a wish, not a subgoal. Do not add it.

## Commands

```bash
PYTHONPATH=agent python3 -m suno_helper subgoal list
PYTHONPATH=agent python3 -m suno_helper subgoal add "Batch CSV export" --priority 4 --tool extension_check --stages ultrawork verify
PYTHONPATH=agent python3 -m suno_helper subgoal done canonical --reason "gates green"
PYTHONPATH=agent python3 -m suno_helper subgoal block profile-parser --reason "needs a host allowlist decision"
PYTHONPATH=agent python3 -m suno_helper subgoal drop old-idea --reason "superseded by batch parser"
```

## The five statuses

| status | meaning | who sets it |
|--------|---------|-------------|
| `pending` | ready or waiting | engine |
| `active` | attempted, gates not yet green | engine |
| `blocked` | waiting on a dependency or a question | engine / human |
| `done` | every gate passed, evidence recorded | engine |
| `dropped` | will not be done, with a reason | human |

Two failures in a row trigger an automatic split into two smaller subgoals. Three
failures lock selection until that split happens — that is the anti-thrash rule.
