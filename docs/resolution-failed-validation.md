# Fiche de Résolution : Échec de Validation de l'Agent Analyze

## Problème
L'action `analyzeOffersAction` échoue systématiquement avec l'erreur :
`analyze offers failed after 3 attempts: Validation failed for analyze response: `

## Analyse Technique
Le problème provient d'une incohérence entre l'utilitaire de parsing partagé et le format de réponse attendu par l'agent d'analyse.

1.  **Utilitaire restrictif** : La fonction `parseJSONFromText` dans `src/app/actions/shared/agent-utils.ts` est codée en dur pour extraire uniquement des **tableaux JSON** (recherche des caractères `[` et `]`).
2.  **Attente de l'agent** : L'agent `analyze` (dans `src/app/actions/analyze.ts`) attend un **objet JSON** contenant un tableau `topOffers` et une chaîne `marketSummary`.
3.  **Résultat du parsing** : Lorsque l'AI renvoie l'objet correct `{ "topOffers": [...], "marketSummary": "..." }`, l'utilitaire `parseJSONFromText` ne détecte que la partie tableau `[...]` à l'intérieur de l'objet.
4.  **Échec Zod** : Le schéma Zod s'attend à recevoir un objet mais reçoit un tableau, ce qui déclenche une erreur de validation immédiate.

## Solution Proposée
Il est nécessaire de généraliser l'utilitaire de parsing pour qu'il détecte le conteneur JSON le plus extérieur (qu'il s'agisse d'un objet `{` ou d'un tableau `[`).

### Fichiers à modifier
*   `src/app/actions/shared/agent-utils.ts` : Mettre à jour `parseJSONFromText` pour détecter dynamiquement le premier caractère JSON valide (`{` ou `[`) et son opposé correspondant.

## Étapes de Résolution
1.  Modifier `parseJSONFromText` pour identifier si la réponse commence par `{` ou `[`.
2.  Adapter l'extraction pour capturer tout le contenu entre les délimiteurs extérieurs.
3.  Tester l'agent `analyze` pour confirmer la réussite de la validation.
