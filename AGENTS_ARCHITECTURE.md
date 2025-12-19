# 🤖 Agents Architecture Modulaire

## 📋 Vue d'ensemble

Le système utilise 3 agents AI spécialisés, chacun optimisé pour les contraintes spécifiques de leur API.

## 🏗️ Structure des Agents

```
src/app/actions/
├── shared/
│   └── agent-utils.ts     # Utilitaires communs
├── fetch.ts               # Agent de récupération (avec tools)
├── analyze.ts             # Agent d'analyse (avec tools)
└── organize.ts            # Agent d'organisation (sans tools)
```

## 🔧 Agent Utils - Utilitaires Partagés

### `agent-utils.ts` fournit :
- **AgentError** : Gestion d'erreurs standardisée
- **parseJSONFromText()** : Parsing JSON robuste pour réponses textuelles
- **retryWithBackoff()** : Retry logic avec exponential backoff
- **validateWithZod()** : Validation de schémas avec Zod
- **detectAPIError()** : Détection d'erreurs API

## 🤖 Spécifications des Agents

### 1. Fetch Agent (`fetch.ts`) - **AVEC TOOLS**
```typescript
// ✅ Utilise googleSearch tools
// ❌ Pas de responseMimeType: "application/json"
// 🎯 Stratégie: Parsing manuel amélioré
```

**Contraintes API :**
- Tools obligatoires pour recherche web
- JSON parsing manuel requis
- Validation Zod des résultats

**Fonctionnalités :**
- Recherche web en temps réel
- Extraction de données des résultats
- Validation stricte des schémas

### 2. Analyze Agent (`analyze.ts`) - **AVEC TOOLS**
```typescript
// ✅ Utilise googleSearch tools  
// ❌ Pas de responseMimeType: "application/json"
// 🎯 Stratégie: Parsing manuel avec validation
```

**Contraintes API :**
- Tools pour contexte de marché
- Parsing manuel des scores
- Schéma complexe à valider

**Fonctionnalités :**
- Analyse comparative des offres
- Recherche de réputation/tendances
- Calcul de scores pondérés

### 3. Organize Agent (`organize.ts`) - **SANS TOOLS**
```typescript
// ❌ Pas besoin de tools
// ✅ Peut utiliser responseMimeType: "application/json"
// 🎯 Stratégie: JSON structuré direct
```

**Contraintes API :**
- Pas de tools nécessaires
- JSON response direct possible
- Traitement de données existantes

**Fonctionnalités :**
- Groupement par catégories
- Organisation temporelle
- Préservation des objets originaux

## 🔄 Workflow d'Exécution

### Fetch Agent
1. Recherche web avec tools
2. Parsing JSON manuel
3. Validation Zod
4. Retry avec backoff

### Analyze Agent  
1. Analyse des offres
2. Recherche contexte avec tools
3. Parsing JSON manuel
4. Calcul des scores
5. Extraction des sources

### Organize Agent
1. Réception des données structurées
2. JSON parsing direct
3. Groupement intelligent
4. Validation légère

## ⚡ Optimisations

### Performance
- **Retry logic** : 3 tentatives max avec backoff
- **Early validation** : Détection rapide d'erreurs
- **Efficient parsing** : JSON extraction optimisée

### Fiabilité
- **Zod validation** : Schémas stricts
- **Error handling** : Codes d'erreur spécifiques
- **API detection** : Gestion des erreurs 400/500

### Maintenabilité
- **Code partagé** : Utilitaires communs
- **Type safety** : TypeScript strict
- **Documentation** : Instructions claires

## 🚀 Avantages de l'Architecture

1. **Spécialisation** : Chaque agent optimisé pour sa tâche
2. **Compatibilité** : Respect des contraintes API
3. **Réutilisabilité** : Utilitaires partagés
4. **Testabilité** : Logique modulaire
5. **Maintenabilité** : Code organisé

## 📊 Monitoring

Chaque agent inclut :
- **Logging détaillé** : Tentatives, succès, erreurs
- **Métriques** : Temps de réponse, taux de succès
- **Error tracking** : Codes d'erreur spécifiques

## 🔧 Développement

### Ajouter un nouvel agent :
1. Créer le fichier dans `actions/`
2. Importer les utilitaires partagés
3. Définir les contraintes API (tools? JSON?)
4. Implémenter avec retry/validation
5. Documenter les spécifications

### Modifier un agent existant :
1. Identifier les contraintes API
2. Utiliser les utilitaires appropriés
3. Maintenir la compatibilité
4. Tester avec build/lint