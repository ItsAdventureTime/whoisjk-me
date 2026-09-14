# AI Engineering Workflow

Workflow version: `6.0`

This is the HUMAN operator guide for the repository's coordinated
AI engineering workflow.

The workflow uses three participants:

- FRONTIER
- IMPLEMENTER
- HUMAN

FRONTIER and IMPLEMENTER are roles, not specific models, vendors,
applications, or coding harnesses.

Examples:

FRONTIER may be:

- ChatGPT Codex with a high-reasoning GPT model;
- Google Antigravity with a high-reasoning Gemini model;
- another capable planning/review environment.

IMPLEMENTER may be:

- ChatGPT Codex;
- Google Antigravity;
- OpenCode;
- Oh My Pi;
- another capable coding environment.

The HUMAN chooses which model/application performs each role.

---

# Core Files

## `docs/ai/README.md`

Purpose:

Human operator manual.

Behavior:

- static;
- created once;
- not modified during normal engineering tasks.

---

## `docs/ai/LAUNCHERS.md`

Purpose:

Permanent copy/paste launcher prompts.

Behavior:

- static;
- created once;
- not modified during normal engineering tasks.

The human copies the appropriate launcher into the selected agent.

Agents do NOT generate replacement launchers for the next agent.

---

## `docs/ai/PHASE_1_FRONTIER.md`

Purpose:

Static operating manual for FRONTIER.

Behavior:

- FRONTIER reads it;
- FRONTIER follows it;
- FRONTIER does NOT write task state into it;
- FRONTIER does NOT modify it during normal engineering work.

---

## `docs/ai/PHASE_2_IMPLEMENTER.md`

Purpose:

Static operating manual for IMPLEMENTER.

Behavior:

- IMPLEMENTER reads it;
- IMPLEMENTER follows it;
- IMPLEMENTER does NOT write task state into it;
- IMPLEMENTER does NOT modify it during normal engineering work.

---

## `docs/ai/AI_HANDOFF.md`

Purpose:

Dynamic shared state for the current engineering task.

Behavior:

- FRONTIER reads and updates it;
- IMPLEMENTER reads and updates it;
- HUMAN normally reads it but does not need to edit it manually;
- updates happen only at meaningful handoff boundaries.

This is the ONLY normal cross-agent runtime coordination document.

---

# What NOT to Configure Yet

This baseline workflow does NOT require modifying:

- project `AGENTS.md`;
- global `AGENTS.md`;
- `~/.config/opencode/AGENTS.md`;
- Antigravity `.agents/rules`;
- model-specific global rules.

The launcher explicitly tells each agent which files to read.

Vendor-specific automation may be added later if useful.

The core workflow must remain usable without it.

---

# The One Rule to Remember

Whenever you do not know what happens next:

Open:

`docs/ai/AI_HANDOFF.md`

Read:

`Operator Control`

Then follow:

`Human action`

Do NOT determine the next phase from:

- chat history;
- an agent saying "done";
- an agent-generated summary;
- memory of the previous session.

`Operator Control` is the coordination source of truth.

---

# Starting the First Task

Open:

`docs/ai/LAUNCHERS.md`

Copy:

`NEW TASK -> FRONTIER`

Paste it into whichever model/application you want to use as FRONTIER.

Replace the request placeholder with your actual request.

FRONTIER will:

1. read `PHASE_1_FRONTIER.md`;
2. read `AI_HANDOFF.md`;
3. inspect the repository as needed;
4. create the active task;
5. investigate and plan;
6. write the implementation contract into `AI_HANDOFF.md`;
7. tell you the exact NEXT STEP.

---

# After FRONTIER Finishes

Open:

`docs/ai/AI_HANDOFF.md`

Read:

`Operator Control`

If it says:

- Next role: `IMPLEMENTER`

copy:

`RUN -> IMPLEMENTER`

from `docs/ai/LAUNCHERS.md`.

Paste it into whichever model/application you want as IMPLEMENTER.

---

# After IMPLEMENTER Finishes

Read `Operator Control` again.

Normally it should say:

- Status: `READY_FOR_FRONTIER_REVIEW`
- Next role: `FRONTIER`

Copy:

`CONTINUE -> FRONTIER`

and run FRONTIER again.

FRONTIER performs independent review.

---

# Human Validation

Some outcomes cannot be proven adequately by automated checks.

Examples:

- visual appearance;
- usability;
- real-device behavior;
- interaction flow;
- subjective product behavior;
- browser-specific behavior;
- real operational usage.

When `Operator Control` says:

- Status: `READY_FOR_HUMAN_VALIDATION`
- Next role: `HUMAN`

you test the actual result yourself.

Then use:

`HUMAN VALIDATION -> FRONTIER`

from `LAUNCHERS.md`.

Do not manually decide whether IMPLEMENTER should fix the result.

FRONTIER triages the human evidence first.

---

# Human-Discovered Bugs or Change Requests

If you discover:

- a bug;
- something visually wrong;
- something missing;
- something that should be removed;
- something that should be added;
- changed requirements;
- unexpected real-world behavior;

use:

`ISSUE OR CHANGE REQUEST -> FRONTIER`

from `LAUNCHERS.md`.

FRONTIER decides whether it is:

1. an in-scope defect;
2. a changed requirement;
3. an architecture/design issue;
4. a separate new task;
5. an observation not reproduced by available evidence.

---

# Normal Workflow

`NEW TASK`

-> FRONTIER

-> `READY_FOR_IMPLEMENTER`

-> IMPLEMENTER

-> `READY_FOR_FRONTIER_REVIEW`

-> FRONTIER

-> `READY_FOR_HUMAN_VALIDATION` when required

-> HUMAN

-> FRONTIER

-> `DONE`

---

# Correction Workflow

If FRONTIER rejects the implementation:

`READY_FOR_FRONTIER_REVIEW`

-> FRONTIER

-> `CHANGES_REQUESTED`

-> IMPLEMENTER

-> `READY_FOR_FRONTIER_REVIEW`

-> FRONTIER

---

# Human Failure Workflow

If human validation fails:

`READY_FOR_HUMAN_VALIDATION`

-> HUMAN reports FAIL to FRONTIER

-> FRONTIER triages

-> IMPLEMENTER when a repair is required

-> FRONTIER reviews again

-> HUMAN validates again when applicable

---

# Definition of Complete

The task is complete ONLY when `Operator Control` says:

- Status: `DONE`
- Next role: `NONE`
- Next phase: `COMPLETE`
- Completion state: `COMPLETE`

These do NOT by themselves mean the task is complete:

- IMPLEMENTER finished coding;
- tests passed;
- FRONTIER reviewed code;
- an agent said "done";
- one screenshot looked correct.

The documented completion gates must all pass.

---

# Repository Synchronization

Both agents must see the same effective repository state.

The simplest setup is for FRONTIER and IMPLEMENTER to use the same
local checkout.

If an application uses an isolated worktree, remote workspace,
different branch, or cloud copy, synchronize the relevant changes
before launching the next role.

Do not assume two applications see identical files merely because
they opened the same repository name.

---

# Workflow Maintenance

The following files are static:

- `README.md`
- `LAUNCHERS.md`
- `PHASE_1_FRONTIER.md`
- `PHASE_2_IMPLEMENTER.md`

Do not change them merely because a normal engineering task changes.

Change them only when the HUMAN explicitly wants to redesign the
workflow.

`AI_HANDOFF.md` is the dynamic file.
