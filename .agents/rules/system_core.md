# System Core Rules - Fundamental Project Engineering Rules

> **STATUS: IMMUTABLE.** These rules constitute the non-negotiable technical contract of the project.  
> Every AI agent MUST strictly comply with them before and during every task.

---

## 1. Fundamental Rules

1. **Strict Typing:** Zero type compilation errors (`tsc --noEmit` or language equivalent).
2. **Quality & Linting:** 0 warnings or errors on the official linting suite.
3. **Architecture & Modularity:** Cleanly decouple data layers, routes/APIs, and presentation.
4. **Security & Secrets:** NEVER commit or expose private keys, tokens, or passwords. Preserve absolute integrity of environment variables.
5. **Error Handling:** Always type and catch errors predictably.
6. **Anti-Saturation Test Cadence:**
   - *Level 1 (Micro-edits):* Do not run global test suites on minor edits to preserve flow and tokens.
   - *Level 2 (Component end / Milestone):* Validate using `python evals/run_fullstack_eval.py --quick` returning a compact JSON report.
   - *Level 3 (Task closure):* Run full validation suite with 0 tolerated errors.
7. **Memory Duality (IDE Artifacts vs. Procedural Rules):**
   - *Episodic Memory:* Use IDE Artifacts for session tracking, complex plans, and reports without polluting conversation context.
   - *Procedural Memory:* Enrich exclusively the targeted modules in `.agents/rules/modules/` (< 80 lines per file).
8. **Pure ASCII & Zero-Emoji Enforcement:** NEVER use emojis, smart quotes, or non-ASCII characters in scripts, evaluation logs, or CLI tools. All terminal output and script code must be pure ASCII to prevent UnicodeEncodeError crashes across heterogeneous platforms (Windows CP1252, Alpine Linux containers, CI runners).

---

## 2. Inviolable SSOT - Task Management (`docs/TASKS.md`)

- **No Unregistered Coding:** All work must correspond to a formalized entry (`TASK-DOMAIN-XX`) in `docs/TASKS.md`.
- **Real-Time Tracking:** Mark `[-]` (In progress) upon starting; check `[x]` upon completion.
- **Strict Ceiling:** `docs/TASKS.md` must never exceed 250 lines (Periodic rollover to `docs/archive/tasks/`).
