# Ticket d'Amélioration : Modernisation de l'Agent Fetch

## Description du Problème
L'implémentation actuelle de `src/app/actions/fetch.ts` présente plusieurs faiblesses qui affectent la stabilité et la qualité des données récupérées :
1.  **Parsing Manuel Fragile** : L'extraction du JSON se fait par manipulation de chaînes de caractères (`indexOf('[')`), ce qui est sujet aux erreurs si l'AI ajoute du texte périphérique.
2.  **Absence de Validation de Schéma** : Les données renvoyées par l'AI ne sont pas validées par Zod, risquant des erreurs plus loin dans le dashboard.
3.  **Gestion des Erreurs Simpliste** : En cas d'échec de parsing, l'agent renvoie des données "mock" (factices), ce qui peut induire l'utilisateur en erreur sur la réalité des résultats.
4.  **Instructions Système Limitées** : Le prompt pourrait être optimisé pour mieux exploiter l'outil `googleSearch`.

## Améliorations Requises

### 1. Robustesse du Parsing
- Migrer vers l'utilisation de `parseJSONFromText` (nouvellement amélioré dans `agent-utils.ts`) pour capturer proprement les réponses, qu'elles soient encapsulées ou non.
- Explorer l'activation de `responseMimeType: "application/json"` si les tests confirment la compatibilité avec l'outil de recherche.

### 2. Validation avec Zod
- Définir un schéma `FetchResponseSchema` (ou réutiliser `OfferSchema`) pour valider chaque offre récupérée.
- Utiliser `validateWithZod` pour garantir l'intégrité des données avant de les renvoyer au client.

### 3. Stratégie de Retry et Erreurs
- Supprimer les `mock-1` et `mock-2` comme fallback.
- Utiliser `retryWithBackoff` pour gérer les échecs temporaires de l'AI ou du réseau.
- Lever une `AgentError` explicite en cas d'échec final pour informer l'interface utilisateur.

### 4. Optimisation du Fetching
- Permettre le passage de paramètres de limite dynamiques.
- Améliorer les instructions système pour exiger des URLs sources valides et des descriptions plus riches.

## Critères d'Acceptation
- [ ] `fetchOffersAction` utilise `agent-utils.ts` pour son orchestration (retry, parse, validate).
- [ ] Toutes les offres renvoyées respectent strictement le contrat d'interface `Offer`.
- [ ] Aucun résultat "mock" n'est généré en silence.
- [ ] Les erreurs d'API (quota, sécurité) sont détectées et remontées proprement.
