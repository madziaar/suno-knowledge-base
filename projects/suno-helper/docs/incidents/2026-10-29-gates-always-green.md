# Incident 2026-10-29 (second) — every gate reported green

**Status:** fixed · **Found by:** a unit test written for the escalation path

## Symptom

A test subgoal whose only acceptance gate pointed at a tool that does not exist
was marked **done** on its first turn. The ledger line next to it read:

```
gate a-tool-that-does-not-exist: fail unknown tool: a-tool-that-does-not-exist
```

Evidence said "fail"; the state said "done".

## Root cause

`_run_gates` returns `(name, (passed, detail))`. Two call sites unpacked it as
`for passed, _ in ...`, which binds `passed` to the gate **name** — always a
non-empty string, hence always truthy:

```python
gates_ok = all(gate_ok for gate_ok, _ in gates)          # bug
return all(passed for passed, _ in self._run_gates(sub))  # same bug
```

The result: `ok` was computed correctly for the *action*, but `_all_gates_passed`
returned `True` unconditionally, so `state.complete()` ran on the same turn as a
failing gate. "Nothing is done without evidence" was silently false.

## Fix

```python
gates_ok = all(passed for _name, (passed, _detail) in gates)
return all(passed for _name, (passed, _detail) in self._run_gates(sub))
```

## Regression test

`test_a_failing_gate_never_completes_a_subgoal` asserts
`_all_gates_passed(sub) is False` for a failing gate, that the turn outcome is
`fail`, and that the subgoal is not `done` afterwards.

## Why it matters

This bug made every other gate in the project decorative. It is the reason
`doctor` reporting "8/8" is not, by itself, evidence of anything — the gates are
only worth the tests that distrust them.
