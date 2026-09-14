# AI Engineering Launchers

Version: `6.0`

These are permanent HUMAN-operated launcher prompts.

Do not ask one agent to invent a prompt for the next agent.

Dynamic task instructions belong in:

`docs/ai/AI_HANDOFF.md`

Static role behavior belongs in:

- `docs/ai/PHASE_1_FRONTIER.md`
- `docs/ai/PHASE_2_IMPLEMENTER.md`

---

# NEW TASK -> FRONTIER

Use this for a brand-new engineering task.

```text
Act as the FRONTIER role for this repository.

First read and follow:

docs/ai/PHASE_1_FRONTIER.md

Then read:

docs/ai/AI_HANDOFF.md

This is a NEW TASK.

My request:

[PASTE MY REQUEST HERE]

Use the repository, Git state, tests, runtime evidence, and current
authoritative documentation when needed.

Create the new active task and perform the Phase 1 work required to
produce a bounded implementation contract.

Do not perform routine Phase 2 implementation.

Before stopping:

1. update docs/ai/AI_HANDOFF.md at the appropriate handoff boundary;
2. make Operator Control accurately describe what happens next;
3. tell me exactly one NEXT STEP.

Do not overwrite an unrelated unfinished active task.
If an active-task conflict exists, explain it and stop.
```

---

# CONTINUE -> FRONTIER

Use this whenever `Operator Control` says the next role is FRONTIER.

```text
Act as the FRONTIER role for this repository.

First read and follow:

docs/ai/PHASE_1_FRONTIER.md

Then read:

docs/ai/AI_HANDOFF.md

Execute only the action currently assigned to FRONTIER by
Operator Control.

Inspect current repository and Git evidence rather than relying on
conversation memory from another agent.

Do not perform routine Phase 2 implementation.

Before stopping:

1. update docs/ai/AI_HANDOFF.md at the appropriate handoff boundary;
2. make Operator Control accurately describe what happens next;
3. tell me exactly one NEXT STEP.
```

---

# RUN -> IMPLEMENTER

Use this whenever `Operator Control` says the next role is IMPLEMENTER.

```text
Act as the IMPLEMENTER role for this repository.

First read and follow:

docs/ai/PHASE_2_IMPLEMENTER.md

Then read:

docs/ai/AI_HANDOFF.md

Execute only the current Implementation Contract assigned to
IMPLEMENTER.

Inspect the current repository and Git state before changing anything.

Preserve correct existing work.

Do not silently expand scope.

Do not redesign the approved architecture unless implementation
evidence proves that the contract cannot work.

Before stopping:

1. execute the required verification;
2. update docs/ai/AI_HANDOFF.md at the appropriate handoff boundary;
3. make Operator Control accurately describe what happens next;
4. tell me exactly one NEXT STEP.
```

---

# HUMAN VALIDATION -> FRONTIER

Use this after Operator Control sends the task to HUMAN validation.

```text
Act as the FRONTIER role for this repository.

First read and follow:

docs/ai/PHASE_1_FRONTIER.md

Then read:

docs/ai/AI_HANDOFF.md

This message contains HUMAN VALIDATION evidence.

Result:

[PASS / FAIL]

Observed behavior:

[WHAT ACTUALLY HAPPENED]

Expected behavior:

[WHAT SHOULD HAVE HAPPENED]

Reproduction steps:

[STEPS IF RELEVANT]

Environment:

[DEVICE / OS / BROWSER / APP / OTHER RELEVANT CONTEXT]

Evidence:

[SCREENSHOT / VIDEO / LOG / OTHER EVIDENCE IF AVAILABLE]

Additional notes:

[OPTIONAL]

Treat the human observation as first-class evidence.

If PASS, verify all remaining completion gates before marking the task
DONE.

If FAIL, classify the failure and determine the correct next action.

Before stopping:

1. update docs/ai/AI_HANDOFF.md;
2. make Operator Control accurately describe what happens next;
3. tell me exactly one NEXT STEP.
```

---

# ISSUE OR CHANGE REQUEST -> FRONTIER

Use this if you discover a bug, want something added, removed, or
changed, or discover unexpected real-world behavior.

```text
Act as the FRONTIER role for this repository.

First read and follow:

docs/ai/PHASE_1_FRONTIER.md

Then read:

docs/ai/AI_HANDOFF.md

I have new HUMAN feedback.

Type:

[BUG / ADD / REMOVE / CHANGE / VISUAL / USABILITY / PERFORMANCE / OTHER]

Observed current behavior:

[WHAT CURRENTLY HAPPENS]

Desired behavior:

[WHAT I WANT TO HAPPEN]

Reason:

[WHY THIS MATTERS]

Reproduction:

[IF APPLICABLE]

Evidence:

[SCREENSHOT / VIDEO / LOG / OTHER EVIDENCE IF AVAILABLE]

Classify this as one of:

1. in-scope implementation defect;
2. changed requirement;
3. architecture/design issue;
4. separate new task;
5. observation not reproduced or contradicted by evidence.

Do not silently broaden the active task.

Update docs/ai/AI_HANDOFF.md accordingly.

Before stopping, tell me exactly one NEXT STEP.
```

---

# WORKFLOW CONFUSION OR BLOCKER -> FRONTIER

Use this when the handoff state itself appears inconsistent or you
cannot determine how the task should proceed.

```text
Act as the FRONTIER role for this repository.

Read and follow:

docs/ai/PHASE_1_FRONTIER.md

Then inspect:

docs/ai/AI_HANDOFF.md

Resolve the current documented blocker or inconsistent workflow state.

Inspect the actual repository and Git state before making assumptions.

Do not restart already-completed work.

Do not perform routine implementation.

Update docs/ai/AI_HANDOFF.md only after determining the correct state.

Tell me exactly one NEXT STEP.
```
