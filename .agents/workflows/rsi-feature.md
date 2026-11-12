---
description: Develop an end-to-end feature with a deterministic 4-phase Recursive Self-Improvement (RSI) cycle.
---

# Workflow: /rsi-feature

This workflow formalizes the Recursive Self-Improvement (RSI) protocol for any AI agent.  
Scrupulously follow these 4 sequential phases without skipping any:

---

## PHASE 1: Preparation & Initial Execution

1. **Cold-Start Pulse & SSOT Task Check (`docs/TASKS.md`):**
   - Run `python evals/rsi_orchestrator.py --pulse` to get an instant briefing on repository health, active tasks, git workspace, and recommended rule modules.
   - Ensure the task exists in `docs/TASKS.md` in the format `TASK-DOMAIN-XX`.
   - If `docs/TASKS.md` approaches 250 lines, run `python evals/rsi_orchestrator.py --rollover` to archive completed `[x]` sprint blocks into `docs/archive/tasks/`.
   - If the task is missing, formalize it immediately with ID, priority, `Target files`, and checkable criteria `[ ]`.
   - Update its status to `[-]` (In progress) in the Kanban and active section.
   - **Episodic Memory (IDE Artifact):** If the task requires multi-step planning or extended tracking, initialize a Markdown Artifact (`plan.md` or `task_tracking.md`) in the IDE's Brain directory. The artifact acts as an out-of-context visual board. Never dump full artifact contents into chat messages to conserve context tokens.

2. **Stack Audit, Topological Map & Blast Radius:**
   - Run `python evals/stack_inspector.py` (or `pnpm run rsi:inspect`) to verify official tooling (MCP servers, framework/ORM skills).
   - Run `python evals/stack_inspector.py --map` to inspect existing singletons and top dependency hubs in `O(1)` before creating new helpers.
   - Before modifying a shared module or interface, run `python evals/stack_inspector.py --impact [file]` to evaluate its reverse-dependency Blast Radius.

3. **Dynamic Contextual Memory Resolution:**
   - Run `python evals/memory_engine.py --inject [target_files]` to inject only the relevant atomic sub-playbooks (`.agents/rules/modules/`) without saturating the context window.
   - Read `.agents/rules/system_core.md` for project-wide invariant rules.

4. **End-to-End Implementation with Anti-Saturation Cadence:**
   - **Local micro-edits:** During routine component/function coding, do NOT trigger global checks (`tsc`/`lint`). Keep editing flow fluid (0 tokens wasted).
   - **Backend / Database:** Model data persistence and APIs with strict input validation (e.g., Zod) and strong typing.
   - **Frontend:** Build interfaces with complete state coverage (`loading`, `error`, `empty`, `data`).
   - **Hygiene:** Exclusively use clean import aliases, removing any unused variables or imports.

---

## PHASE 2: Deterministic Evaluation & Reflexive Loop (Max 3 Attempts)

1. **Run Deterministic Judge (Milestone vs. Closure Cadence):**
   - **Mid-task / Milestone check:** Always run the compact quick mode:
     ```bash
     python evals/run_fullstack_eval.py --quick
     # or pnpm run eval:quick
     ```
     The compact JSON output (with `failed_steps` truncated to 10 lines) protects the agent's context budget.
   - **Before final closure only:** Run the full test suite:
     ```bash
     python evals/run_fullstack_eval.py
     # or pnpm run eval:fullstack
     ```

2. **If Score is 100/100 on Attempt 1:**
   - If the task was a **security audit, debugging session, or refactor** that exposed and resolved code defects: **Execute PHASE 3** to record critical learnings into the playbook.
   - If it was a standard feature addition without novel anti-patterns: Proceed directly to **PHASE 4**.

3. **If Score is Below 100/100:**
   - Inspect the compact failure report in `evals/logs/trajectory_latest.json`.
   - Identify the exact root cause (Typecheck, Lint, Test, or Schema).
   - Fix application code and re-evaluate:
     ```bash
     python evals/rsi_orchestrator.py --eval --attempt 2
     ```
   - Iterate until reaching 100/100 (maximum 3 attempts).
   - *If the score remains below 100 after 3 attempts, halt execution and request human guidance detailing the roadblock.*

---

## PHASE 3: Meta-Cognitive Mutation (Learning & Optimization)

This phase triggers whenever an error was resolved (> 1 attempt) OR a security audit/refactoring neutralized vulnerabilities or anti-patterns:

1. Assume the persona defined in `.agents/prompts/meta_optimizer.md`.
2. Pinpoint the affected layer (DB, Server Action, UI, Types, Security).
3. Formulate a general, preventive 1-2 line rule (e.g., `[R-DOM-XX] Always...`).
4. **Anti-Bloat & Modularity (< 80 lines):** Ensure the target sub-module in `.agents/rules/modules/` remains strictly under 80 lines using a 2-step lossless strategy: first merge semantically overlapping or redundant rules without losing technical specificity; second, if all rules are distinct and the file is full, split the module into finer domain sub-modules (`[sub_domain].md`) and register the new triggers in `evals/memory_engine.py` and `.agents/rules/fullstack_playbook.md`.
5. Update the target sub-module in `.agents/rules/modules/` and keep `.agents/rules/fullstack_playbook.md` synchronized.

---

## PHASE 4: Final Validation, Git Guardrail & Closure

1. **Verify Guardrails & Scope Alignment:**
   ```bash
   python evals/rsi_orchestrator.py --guardrail
   ```
   Confirm `docs/TASKS.md` (`< 250L`), modules (`< 80L`), and Scope Guard (`git status` aligned with `Target files` in `docs/TASKS.md`).
2. **Double Deterministic Check:**
   - Typecheck (0 errors).
   - Linter (0 errors / warnings).
3. **Automatic SemVer Version Sealing:**
   - Run `python evals/version_manager.py --bump patch` to bump version, seal `CHANGELOG.md`, and create Git tag.
4. **SSOT Task Closure in `docs/TASKS.md`:**
   - Check off all acceptance criteria `[x]`.
   - Mark task completed `[x]`.
   - Move task entry to `Completed Tasks History` with date and list of created/modified files.
   - Update the synthetic Kanban table.
5. **Final User Report:**
   - Delivered and verified feature (100/100 score).
   - Sealed SemVer release.
   - Number of attempts required.
   - Lessons learned and newly registered rules (with exact diff if applicable).
