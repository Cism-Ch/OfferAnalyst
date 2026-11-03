# 📖 Fullstack Playbook (Index de la Mémoire Évolutive RSI)
> **ARCHITECTURE MODULAIRE :** Ce fichier constitue la table des matières centrale reliant les sous-modules de règles spécialisés situés dans `.agents/rules/modules/`.  
> Pour toute tâche ciblée, l'agent ou le moteur d'injection `evals/memory_engine.py` charge dynamiquement uniquement les sous-modules concernés.

---

## 🗂️ Modules de Règles Spécialisés

| Domaine | Fichier Source | Description & Portée |
| :--- | :--- | :--- |
| **BDD & ORM** | [db.md](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/.agents/rules/modules/db.md) | Prisma, MongoDB ObjectIds, migrations, singletons et intégrité. |
| **Backend & Actions** | [api_backend.md](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/.agents/rules/modules/api_backend.md) | Server Actions, validation Zod, QStash, Redis, retries et revalidatePath. |
| **Frontend & UI** | [ui_frontend.md](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/.agents/rules/modules/ui_frontend.md) | React 19, Tailwind v4, ergonomie mobile-first, Shadcn, Radix Focus Traps. |
| **Sécurité & Auth** | [security_auth.md](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/.agents/rules/modules/security_auth.md) | Better-Auth, clés AES-256-GCM, cookies, Anti-SSRF et anti-IDOR. |
| **Intégration & AI** | [integration_ai.md](file:///c:/Users/hanok/Dev/Personal-Project/OfferAnalyst/.agents/rules/modules/integration_ai.md) | OpenRouter SDK, flux LLM, exports, SemVer et gestion de contexte. |

---

## 📌 Règles Fondamentales Transverses
- **Plafond Modulaire :** Aucun sous-module ne doit dépasser 80 lignes. En cas de dépassement, compacter ou ventiler en sous-fichiers.
- **Ajout Dynamique :** Tout nouveau domaine technologique (ex: mobile natif, webhooks Stripe, etc.) donne lieu à un nouveau sous-module dans `.agents/rules/modules/<nom>.md`.
- **Injection Contextuelle :** Utiliser `python evals/memory_engine.py --inject [fichiers]` pour récupérer exactement les règles pertinentes.
