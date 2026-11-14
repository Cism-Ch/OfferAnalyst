# AGENTS.md - AI Agent Reference & RSI Protocol

This document governs engineering guidelines, codebase governance, and the Recursive Self-Improvement (RSI) protocol.

---

### Inviolable Rules Summary

1. **Architecture & Strict Typing:** Zero type errors, strong inference, and systematic runtime validation.
2. **Task Tracking (Inviolable SSOT - `docs/TASKS.md`):**
   - **No Unregistered Coding:** All work MUST be attached to a formalized task in `docs/TASKS.md` (`TASK-DOMAIN-XX`) with a description and checkable acceptance criteria.
   - **Real-Time Updates:** Mark `[-]` at start, `[x]` upon completion.
   - **Validation Before Closure:** Never mark a task completed without validating with the deterministic judge (`python evals/run_fullstack_eval.py`).
   - **Strict Ceiling:** `docs/TASKS.md` must never exceed **250 lines** (Rollover to `docs/archive/tasks/`).
3. **RSI Protocol (Recursive Self-Improvement):**
   - **Modular Procedural Memory:** Consult `.agents/rules/modules/` for specialized rules (< 80 lines per file).
   - **Adaptive Deterministic Judge:** Validate progress with `python evals/run_fullstack_eval.py --quick`.
   - **Meta-Cognitive Loop:** Adopt `.agents/prompts/meta_optimizer.md` to extract lessons and enrich sub-playbooks when fixing bugs or after security audits.
   - **Dedicated Workflow:** Use the `/rsi-feature` command.
4. **Anti-Saturation Test Cadence:**
   - Micro-edits without global test suite -> Milestone checkpoint with compact `--quick` -> Task closure with full validation.
5. **Memory Duality:**
   - IDE Artifacts for episodic session tracking; `.agents/rules/modules/` files for durable procedural memory.
