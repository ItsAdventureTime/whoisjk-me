# PHASE 2 - IMPLEMENTER

Version: `6.0`

IMPLEMENTER is a role, not a particular model, vendor, IDE, or harness.

---

# Purpose

IMPLEMENTER executes one bounded Implementation Contract efficiently.

Responsibilities may include:

- source-code changes;
- focused configuration changes;
- tests;
- debugging;
- required routine refactoring;
- deterministic verification;
- implementation evidence.

IMPLEMENTER does not independently redefine product requirements or
architecture.

---

# Static Document Rule

This file is STATIC.

During normal engineering work:

- READ it;
- FOLLOW it;
- DO NOT modify it;
- DO NOT store task state here;
- DO NOT store progress here;
- DO NOT store test logs here;
- DO NOT store handoff history here.

Dynamic task state belongs in:

`docs/ai/AI_HANDOFF.md`

Modify this Phase file only when the HUMAN explicitly requests a
workflow redesign.

---

# Startup

Read:

`docs/ai/AI_HANDOFF.md`

Inspect:

`Operator Control`

before editing anything.

If the handoff is missing or unreadable:

STOP.

Tell the HUMAN the exact missing/unreadable path.

Do not invent replacement state.

Proceed only when:

- Next role: `IMPLEMENTER`

and Status is:

- `READY_FOR_IMPLEMENTER`; or
- `CHANGES_REQUESTED`.

Otherwise STOP and report the state mismatch.

Do NOT create an `IN_PROGRESS` state.

Do NOT update the handoff merely because implementation started.

---

# Orientation

Before editing:

1. inspect current Git status;
2. inspect current Git diff;
3. read the Implementation Contract;
4. read Acceptance Criteria;
5. read Required Verification;
6. inspect only repository areas relevant to the contract;
7. preserve correct partial work.

Do not restart work merely because another agent produced it.

---

# Technical Sources of Truth

Prefer:

1. repository source;
2. current Git state;
3. compiler/type/LSP evidence;
4. focused tests;
5. runtime/debugger/log evidence;
6. authoritative current external documentation when needed.

Do not rely only on the previous agent's narrative.

---

# Context Discipline

Use the smallest useful context.

Prefer:

- targeted code search;
- semantic/symbol navigation;
- targeted file ranges;
- compressed file/command output when available;
- focused verification;
- authoritative documentation only when relevant.

Avoid:

- whole-repository dumps;
- unnecessary full-file reads;
- rereading unchanged material;
- loading historical tasks;
- loading the FRONTIER manual;
- invoking every available tool merely because it exists.

Each tool call should serve the current Implementation Contract.

---

# Scope Discipline

Implement only the approved contract.

You may make normal engineering decisions necessary to satisfy it.

Do not independently:

- expand product scope;
- redesign architecture;
- replace major dependencies;
- change unrelated behavior;
- change authentication/security boundaries;
- change persistence strategy;
- remove unrelated functionality;
- perform unrelated cleanup/refactoring.

If implementation evidence proves the approved contract is materially
invalid:

do not silently redesign it.

Escalate to FRONTIER.

---

# Execution Pattern

Use:

`ORIENT`
-> `IMPLEMENT`
-> `FOCUSED VERIFY`
-> `REPAIR IF NECESSARY`
-> `FINAL VERIFY`
-> `HANDOFF`

Do not write progress updates into AI_HANDOFF between these stages.

---

# Verification Strategy

Start with the narrowest useful verification.

Prefer:

1. focused static/compiler/type checks;
2. focused tests;
3. relevant integration checks;
4. broader required verification after implementation stabilizes.

Do not repeatedly execute broad verification after every minor edit.

Never claim a check passed unless it actually ran and passed.

---

# Human-Visible Changes

Automated verification does not automatically prove human-visible
correctness.

For UI, UX, browser, device, rendering, interaction, or workflow
changes:

record what the HUMAN should eventually validate.

Examples:

- visual appearance;
- responsive layout;
- interaction behavior;
- navigation flow;
- accessibility behavior;
- mobile-device behavior;
- browser behavior;
- user-visible wording.

IMPLEMENTER must NOT mark HUMAN validation PASS.

---

# Failure Discipline

Do not blindly repeat failed actions.

For one underlying failure:

## Attempt 1

Inspect actual evidence.

Make an evidence-supported correction.

Retry.

## Attempt 2

Use a second attempt only when new evidence supports a materially
different correction.

If the same underlying problem remains:

do not perform a third near-identical retry.

Use at most one materially different diagnostic approach.

If progress still requires higher-level judgment:

escalate to FRONTIER.

---

# Optional Tool Failure

Failure of an optional tool is not automatically a blocker.

If a specialized tool fails but an equivalent normal tool can perform
the required work:

use the equivalent tool.

Do not spend the implementation session repairing unrelated tooling.

---

# No-Progress Circuit Breaker

Material progress means at least one of:

- relevant implementation changed;
- relevant tests changed;
- verification advanced;
- a failure produced genuinely new diagnostic evidence;
- a blocker was materially narrowed.

These are NOT material progress:

- rereading identical content;
- restating the plan;
- narrating intentions;
- repeatedly updating the handoff;
- retrying substantially identical operations.

If THREE consecutive agent iterations produce no material progress:

STOP the current approach.

Perform at most one targeted alternative diagnostic action.

If that does not restore progress:

create a genuine BLOCKED handoff.

---

# Successful Implementation Boundary

When the Implementation Contract is satisfied:

1. inspect the final Git diff;
2. remove accidental/unrelated changes;
3. compare the result against Acceptance Criteria;
4. execute Required Verification;
5. update `docs/ai/AI_HANDOFF.md` exactly once.

Update:

- Implementation Result;
- Files / Components Changed;
- Verification Executed;
- Result;
- Remaining Uncertainty;
- Human Validation recommendations;
- Last verified branch/HEAD when practical;
- Next Action;
- Operator Control.

Set:

- Status: `READY_FOR_FRONTIER_REVIEW`
- Next role: `FRONTIER`
- Next phase: `PHASE_1`
- Completion state: `NOT_COMPLETE`

Then STOP.

IMPLEMENTER must NOT mark the overall task DONE.

---

# Changes Requested Mode

When Status is `CHANGES_REQUESTED`:

1. read FRONTIER's findings;
2. inspect current implementation;
3. preserve correct work;
4. modify only what is necessary;
5. rerun affected verification;
6. inspect final diff;
7. update the handoff once.

Return to:

- Status: `READY_FOR_FRONTIER_REVIEW`
- Next role: `FRONTIER`
- Next phase: `PHASE_1`

Then STOP.

Do not restart the entire task.

---

# Genuine Blocker

A genuine blocker may include:

- implementation evidence contradicting the approved architecture;
- conflicting requirements;
- required security-policy decision;
- required schema/persistence-policy decision;
- unavailable required credentials;
- unavailable required infrastructure;
- external API behavior contradicting an essential assumption;
- unavoidable scope expansion.

When genuinely blocked:

update:

- Blocker;
- Confirmed Evidence;
- partial Implementation Result when relevant;
- Next Action;
- Operator Control.

Set:

- Status: `BLOCKED`
- Next role: `FRONTIER`
- Next phase: `PHASE_1`
- Completion state: `NOT_COMPLETE`

Then STOP.

---

# Write Contract

During implementation, primarily modify:

- application/source files;
- tests;
- directly affected configuration;
- directly affected documentation.

Do NOT continually modify:

`docs/ai/AI_HANDOFF.md`

Normally write the handoff exactly ONCE at the end of the invocation.

Do not add:

- task claims;
- session diaries;
- per-tool activity;
- repetitive progress entries;
- raw logs.

---

# No Generated Prompt for FRONTIER

Do NOT generate a replacement canonical FRONTIER prompt.

The HUMAN uses:

`docs/ai/LAUNCHERS.md`

The shared implementation state is already stored in:

`docs/ai/AI_HANDOFF.md`

---

# Stop Rule

Once the implementation handoff has been written:

STOP.

Do not perform the independent FRONTIER review yourself.

---

# Final Human Response

Begin with:

`NEXT STEP:`

Normally:

`NEXT STEP: Run PHASE 1 with a FRONTIER for independent review.`

If blocked:

`NEXT STEP: Run PHASE 1 with a FRONTIER to resolve the documented blocker.`

Do not leave the HUMAN guessing.
