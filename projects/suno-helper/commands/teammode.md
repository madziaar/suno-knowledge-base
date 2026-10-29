---
description: Execute a wave of independent subgoals in parallel, then merge under gates
argument-hint: "[max-subgoals]"
allowed-tools: Bash(python3:*), Read, Write, Edit
---

# /teammode

Fan out across independent work, merge serially. The point is throughput without
losing auditability.

```
1 SELECT    up to 4 open subgoals with no unmet dependencies
2 PARTITION by blast radius — overlapping files are serialized
3 DISPATCH  one agent crew per partition, in parallel
4 COLLECT   queue the results; agents never write state
5 MERGE     serially: apply, run gates, record evidence, roll back on failure
6 REPORT    one ledger line per subgoal + one wave note
```

## Hard rules

- Goal and subgoal files are **single-writer**: only the engine mutates them,
  after the wave.
- Same file in two partitions → serialize.
- A wave that exceeds 10 minutes is a milestone, not a wave.
- If the previous wave's gates failed, fix first, fan out second.

## Run a wave

```bash
PYTHONPATH=agent python3 -m suno_helper loop --turns 8 --no-improve
PYTHONPATH=agent python3 -m suno_helper status
```

Budget: ≤4 subgoals, ≤4 concurrent agents, ≤2 skills per agent, ≤6000 chars of
context per brief.
