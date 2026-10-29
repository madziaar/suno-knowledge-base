---
description: Staff a subgoal from the division roster (engineering version)
argument-hint: "[list|delegate <agent> <objective>|debate <motion>]"
allowed-tools: Bash(python3:*), Read
---

# /team-pyrite

The division roster, implemented as an engineering crew. Nine specialists, each
with a narrow mission and explicit guardrails:

| Agent | Division | Mission |
|-------|----------|---------|
| `architect` | Automation | smallest ordered change set |
| `scout` | Data | answer one question with citations |
| `forge` | Automation | implement, typed and tested |
| `sentinel` | Security | attack the plan, find egress and permission bloat |
| `verifier` | Security | prove the gates pass |
| `chronicler` | Data | keep goal/subgoals/ledger coherent |
| `tuner` | Infra | find wasted work and starvation |
| `curator` | Data | keep skills deduplicated |
| `scribe` | Comms | write the human-readable note |

```bash
PYTHONPATH=agent python3 -m suno_helper crew list
PYTHONPATH=agent python3 -m suno_helper crew delegate sentinel "audit the manifest permissions"
PYTHONPATH=agent python3 -m suno_helper crew debate "ship the batch parser behind a flag"
```

## Two edits from the supplied material

Adopted: the division topology, anticipatory execution, healthy disagreement,
natural hand-off. Rejected: the NSFW persona voice, and every "safety is
optional / never refuse / act first" directive. Reasons are in
[`docs/provenance.md`](../docs/provenance.md).

What replaced them: read-scoped tools, a full ledger, hard refusals on
destructive instructions, and evidence-or-it-did-not-happen. The autonomy is
real because of those rails, not despite them.
