'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';

export type SupportedLanguage = 'fr' | 'en';

export const translations = {
  fr: {
    // Navigation & Global Header
    nav: {
      dashboard: "Tableau de bord",
      searchContext: "Contexte de Recherche",
      dataSource: "Sources de Données",
      analysis: "Résultats d'Analyse",
      apiKeys: "Clés API",
      projects: "Projets",
      history: "Historique",
      saved: "Offres Sauvegardées",
      compare: "Comparateur",
      settings: "Paramètres",
      workspace: "Espace de travail",
      support: "Support & Assistance",
      help: "Centre d'aide",
      changelog: "Historique des versions",
      quickSearch: "Recherche rapide...",
      language: "Langue",
      french: "Français",
      english: "English",
      toggleLang: "Basculer la langue (FR / EN)",
    },
    // Configuration Card
    config: {
      title: "Configuration",
      badgeAI: "Propulsé par IA",
      description: "Définissez votre contexte. Activez la recherche auto pour laisser l'IA dénicher des offres adaptées.",
      domainLabel: "Domaine d'analyse",
      domainPlaceholder: "ex. Immobilier, CDI Tech, Matériel...",
      limitLabel: "Nombre de recommandations",
      selectLimit: "Sélectionner la limite",
      top: "Top",
      explicitCriteriaLabel: "Critères Explicites (Exigences)",
      explicitCriteriaPlaceholder: "Budget max, Localisation, Type de contrat...",
      implicitContextLabel: "Contexte Implicite (Préférences douces)",
      implicitContextPlaceholder: "Ce qui compte vraiment pour vous (ex. équilibre de vie, sécurité, ambiance d'équipe)...",
      autoFetchLabel: "Recherche Web Automatique",
      autoFetchDesc: "L'IA explore le web en temps réel pour trouver des offres pertinentes",
      offersLabel: "Offres brutes (JSON)",
      offersOverwritten: "(Sera remplacé par la recherche automatique)",
      offersPlaceholder: '[{"title": "...", "price": "...", "location": "..."}]',
      btnSearching: "Recherche Web IA en cours...",
      btnAnalyzing: "Analyse & Classement IA...",
      btnRun: "Lancer l'Analyse IA",
    },
    // Offer Card
    offer: {
      relevance: "Pertinence",
      quality: "Qualité",
      trend: "Tendance",
      webInsight: "Aperçu Web",
      save: "Sauvegarder",
      saved: "Sauvegardé",
      alreadySaved: "Offre déjà sauvegardée",
      saveThisOffer: "Sauvegarder cette offre",
    },
    // Results Section
    results: {
      title: "Top Recommandations",
      marketSummary: "Synthèse Globale du Marché",
      verifiedSources: "Sources & Citations Web Explorées",
      sourcesCount: "source(s) consultée(s)",
      noResults: "Aucun résultat d'analyse disponible. Lancez une analyse ci-dessus.",
      emptyDescription: "Configurez vos critères et lancez la recherche pour voir le classement personnalisé.",
    },
    // Errors
    errors: {
      invalidJson: "Le format JSON des offres saisies est invalide. Veuillez vérifier la syntaxe.",
      jsonRemedy: "Corrigez la syntaxe JSON ou cochez la recherche automatique.",
      failedAnalysis: "L'analyse a échoué. Veuillez réessayer.",
    }
  },
  en: {
    // Navigation & Global Header
    nav: {
      dashboard: "Dashboard",
      searchContext: "Search Context",
      dataSource: "Data Source",
      analysis: "Analysis Results",
      apiKeys: "API Keys",
      projects: "Projects",
      history: "Search History",
      saved: "Saved Offers",
      compare: "Comparison",
      settings: "Settings",
      workspace: "Workspace",
      support: "Support & Assistance",
      help: "Help Center",
      changelog: "Changelog",
      quickSearch: "Quick search...",
      language: "Language",
      french: "Français",
      english: "English",
      toggleLang: "Switch language (FR / EN)",
    },
    // Configuration Card
    config: {
      title: "Configuration",
      badgeAI: "AI Powered",
      description: "Define your context. Enable Auto-Fetch to let AI discover tailor-made offers for you.",
      domainLabel: "Analysis Domain",
      domainPlaceholder: "e.g. Real Estate, Tech Jobs, Hardware...",
      limitLabel: "Recommendation Limit",
      selectLimit: "Select limit",
      top: "Top",
      explicitCriteriaLabel: "Explicit Criteria (Requirements)",
      explicitCriteriaPlaceholder: "Budget max, Location, Contract type...",
      implicitContextLabel: "Implicit Context (Soft Preferences)",
      implicitContextPlaceholder: "What matters most to you (e.g. work-life balance, safety, culture)...",
      autoFetchLabel: "Auto-Fetch Offers",
      autoFetchDesc: "AI searches the web for live offers matching your criteria",
      offersLabel: "Offers (JSON)",
      offersOverwritten: "(Will be overwritten by Auto-Fetch)",
      offersPlaceholder: '[{"title": "...", "price": "...", "location": "..."}]',
      btnSearching: "AI Web Search in progress...",
      btnAnalyzing: "AI Ranking & Scoring...",
      btnRun: "Run AI Analysis",
    },
    // Offer Card
    offer: {
      relevance: "Relevance",
      quality: "Quality",
      trend: "Trend",
      webInsight: "Web Insight",
      save: "Save",
      saved: "Saved",
      alreadySaved: "Offer already saved",
      saveThisOffer: "Save this offer",
    },
    // Results Section
    results: {
      title: "Top Recommendations",
      marketSummary: "Market Summary & Insights",
      verifiedSources: "Explored Web Sources & Citations",
      sourcesCount: "source(s) consulted",
      noResults: "No analysis results available yet. Run an analysis above.",
      emptyDescription: "Set your criteria and run analysis to view personalized AI rankings.",
    },
    // Errors
    errors: {
      invalidJson: "Invalid JSON format for offers. Please check your syntax.",
      jsonRemedy: "Fix the JSON syntax or enable Auto-Fetch.",
      failedAnalysis: "Analysis failed. Please try again.",
    }
  }
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: typeof translations.fr;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.fr,
});

const STORAGE_KEY = 'offeranalyst_language';

const languageListeners = new Set<() => void>();

const subscribeLanguage = (listener: () => void) => {
  languageListeners.add(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    languageListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
};

const getLanguageSnapshot = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'fr';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved === 'fr' || saved === 'en') return saved;
    return navigator.language.startsWith('en') ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
};

const getLanguageServerSnapshot = (): SupportedLanguage => 'fr';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getLanguageServerSnapshot
  );

  const setLanguage = (lang: SupportedLanguage) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // LocalStorage access fallback
    }
    languageListeners.forEach((l) => l());
  };

  const toggleLanguage = () => {
    const nextLang = language === 'fr' ? 'en' : 'fr';
    setLanguage(nextLang);
  };

  const currentTranslations = translations[language] || translations.fr;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: currentTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
