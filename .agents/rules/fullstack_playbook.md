# Index & Router for RSI Procedural Memory

> This file serves as a catalog and routing index to the modular memory sub-playbooks located in `.agents/rules/modules/`.  
> The AI agent uses the engine `evals/memory_engine.py --inject [files]` to dynamically load only the relevant domain rules.

---

### Specialized Sub-Module Map (< 80 lines per file)

| Domain | Rule File | Scope & Triggers |
| :--- | :--- | :--- |
| **Database** | [db.md](modules/db.md) | Data modeling, migrations, transactions, ORM schema validation. |
| **API & Backend** | [api_backend.md](modules/api_backend.md) | Server routes, actions, background jobs, caching, idempotency. |
| **Frontend & UI** | [ui_frontend.md](modules/ui_frontend.md) | Components, accessibility, styling, mobile-first, 4-state management. |
| **Security & Auth** | [security_auth.md](modules/security_auth.md) | Authentication, sessions, roles, encryption, sanitization. |
| **AI Integration** | [integration_ai.md](modules/integration_ai.md) | LLM models, prompts, API key management, structured parsing. |
| **Pattern Recognition** | [pattern_recognition.md](modules/pattern_recognition.md) | Cognitive routing (System 1/2), structural mimicry, fast-fail reflexes. |
