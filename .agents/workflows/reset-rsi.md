---
description: Resets the project task registry, changelog, and evaluation logs to a clean template baseline for starting a new project.
---

# Workflow: /reset-rsi

This workflow allows an AI agent or developer to reset the repository's episodic task memory, changelog history, and evaluation logs to a pristine state.

---

## Steps for the Agent

1. **User Confirmation Check:**
   - Warn the user that this will reset `docs/TASKS.md` to a clean baseline (`TASK-INIT-01`), clear `docs/archive/tasks/`, reset `CHANGELOG.md` to an unreleased state, and purge evaluation trajectory logs in `evals/logs/`.
   - Ask for confirmation unless the user explicitly specified `--force` or requested an immediate reset.

2. **Execution:**
   - Run the reset engine with automatic zip backup:
     ```bash
     python evals/reset_rsi.py --force
     ```
   - If the user requested a dry run:
     ```bash
     python evals/reset_rsi.py --dry-run
     ```

3. **Deterministic Validation:**
   - Verify project integrity immediately after reset:
     ```bash
     python evals/run_fullstack_eval.py --quick
     ```
   - Score must be 100/100 PASS.

4. **Initial Project Commit (Optional):**
   - If starting fresh on a new repository, stage the clean slate and commit:
     ```bash
     git add docs/TASKS.md CHANGELOG.md evals/logs/
     git commit -m "chore(rsi): reset project task registry and memory baseline"
     ```

5. **Report to User:**
   - Confirm that the repository memory has been reset.
   - Mention the path to the backup zip archive in `evals/backups/`.
   - Remind the user to configure their first task in `docs/TASKS.md` under `TASK-INIT-01`.
