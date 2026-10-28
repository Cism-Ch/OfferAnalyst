'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';

export type SupportedLanguage = 'fr' | 'en';

export const translations = {
  fr: {
    // Navigation & Shell
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
      sectionMain: "Parcours Principal",
      sectionMore: "Navigation",
      sectionDashboard: "Tableau de Bord",
      sectionAdmin: "Administration",
      adminConsole: "Console d'administration",
      activeSession: "Session active",
      guestSession: "Gratuit / Invité",
      expandSidebar: "Agrandir la barre latérale",
      collapseSidebar: "Réduire la barre latérale",
      openMenu: "Ouvrir le menu de navigation",
      closeMenu: "Fermer le menu de navigation",
    },
    // Route Meta (Header & Breadcrumbs)
    routes: {
      '/': {
        title: "Tableau de bord",
        description: "Analyse contextuelle et scoring d'offres propulsés par IA",
        breadcrumbs: ["Accueil", "Tableau de bord"],
      },
      '/search-context': {
        title: "Contexte de Recherche",
        description: "Définissez votre domaine, vos critères stricts et vos préférences souples",
        breadcrumbs: ["Accueil", "Contexte"],
      },
      '/data-source': {
        title: "Sources de Données",
        description: "Configurez l'exploration web automatisée ou la saisie JSON manuelle",
        breadcrumbs: ["Accueil", "Sources"],
      },
      '/analysis': {
        title: "Résultats d'Analyse",
        description: "Recommandations IA, scoring multi-axes et synthèse du marché",
        breadcrumbs: ["Accueil", "Analyse"],
      },
      '/dashboard/api-keys': {
        title: "Clés API",
        description: "Configurez vos clés d'accès aux modèles d'IA (BYOK)",
        breadcrumbs: ["Accueil", "Tableau de bord", "Clés API"],
      },
      '/projects': {
        title: "Projets",
        description: "Gérez vos espaces d'analyse et recherches sauvegardées",
        breadcrumbs: ["Accueil", "Projets"],
      },
      '/history': {
        title: "Historique",
        description: "Consultez l'historique chronologique de vos analyses passées",
        breadcrumbs: ["Accueil", "Historique"],
      },
      '/saved': {
        title: "Offres Sauvegardées",
        description: "Votre sélection personnalisée d'offres mémorisées et comparables",
        breadcrumbs: ["Accueil", "Sauvegardes"],
      },
      '/compare': {
        title: "Comparateur d'Offres",
        description: "Comparaison visuelle et analytique côte à côte de vos offres",
        breadcrumbs: ["Accueil", "Comparateur"],
      },
      '/dashboard/settings': {
        title: "Paramètres",
        description: "Préférences de compte, thèmes visuels et personnalisation",
        breadcrumbs: ["Accueil", "Tableau de bord", "Paramètres"],
      },
      '/dashboard/workspace': {
        title: "Espace de travail",
        description: "Espaces d'équipe, contextes partagés et modèles de requêtes",
        breadcrumbs: ["Accueil", "Tableau de bord", "Espace de travail"],
      },
      '/dashboard/support': {
        title: "Support & Assistance",
        description: "Centre de support technique et parrainage du projet",
        breadcrumbs: ["Accueil", "Tableau de bord", "Support"],
      },
      '/dashboard/analytics': {
        title: "Analytiques & Insights",
        description: "Statistiques d'utilisation, historique de recherche et métriques d'IA",
        breadcrumbs: ["Accueil", "Tableau de bord", "Analytiques"],
      },
      '/help': {
        title: "Centre d'aide",
        description: "Guides pratiques, foire aux questions et dépannage",
        breadcrumbs: ["Accueil", "Aide"],
      },
      '/changelog': {
        title: "Journal des modifications",
        description: "Historique des mises à jour, évolutions et correctifs",
        breadcrumbs: ["Accueil", "Changelog"],
      },
      '/privacy': {
        title: "Politique de Confidentialité",
        description: "Engagement sur la protection de la vie privée et des données",
        breadcrumbs: ["Accueil", "Confidentialité"],
      },
      '/terms': {
        title: "Conditions d'Utilisation",
        description: "Conditions générales d'accès et d'utilisation de la plateforme",
        breadcrumbs: ["Accueil", "Conditions"],
      },
      '/cookies': {
        title: "Gestion des Cookies",
        description: "Préférences relatives aux cookies et à la télémétrie locale",
        breadcrumbs: ["Accueil", "Cookies"],
      },
      '/admin': {
        title: "Console d'Administration",
        description: "Supervision de la plateforme, gestion des rôles et télémétrie FinOps",
        breadcrumbs: ["Accueil", "Administration"],
      },
      '/onboarding': {
        title: "Configuration Initiale",
        description: "Personnalisez votre expérience OfferAnalyst en quelques étapes",
        breadcrumbs: ["Accueil", "Onboarding"],
      },
      '/auth/login': {
        title: "Connexion",
        description: "Connectez-vous à votre compte OfferAnalyst",
        breadcrumbs: ["Accueil", "Authentification", "Connexion"],
      },
      '/auth/signup': {
        title: "Création de Compte",
        description: "Créez un compte pour synchroniser vos projets et clés API dans le cloud",
        breadcrumbs: ["Accueil", "Authentification", "Inscription"],
      },
      '/auth/reset': {
        title: "Réinitialisation du Mot de Passe",
        description: "Récupérez l'accès à votre compte en toute sécurité",
        breadcrumbs: ["Accueil", "Authentification", "Réinitialisation"],
      },
      '/auth/verify': {
        title: "Vérification Email",
        description: "Vérification de votre adresse email",
        breadcrumbs: ["Accueil", "Authentification", "Vérification"],
      },
    },
    // Home Page
    home: {
      heroTitle: "Bienvenue sur OfferAnalyst",
      heroSubtitle: "Analyse contextuelle et scoring d'offres en temps réel propulsés par IA",
      cardTitle: "Démarrer une Analyse IA",
      cardDescription: "Suivez ces étapes pour rechercher, évaluer et classer les offres selon votre profil",
      badgeAI: "Analyse IA Avancée",
      badgeRanking: "Classement Contextuel",
      badgeVisualization: "Scores Multi-Axes",
      badgeRealtime: "Temps Réel",
      workflowTitle: "Parcours d'Analyse",
      step1Title: "1. Définir le Contexte",
      step1Desc: "Précisez votre domaine, vos exigences indispensables et vos préférences de vie",
      step2Title: "2. Configurer la Source",
      step2Desc: "Optez pour le scraping web en direct ou collez vos offres en JSON",
      step3Title: "3. Résultats & Recommandations",
      step3Desc: "Consultez le classement IA, la décomposition des notes et les citations web",
      btnGetStarted: "Commencer cette étape",
      previewTitle: "Aperçu de l'Analyse",
      scoreDistTitle: "Distribution des Scores",
      scoreDistDesc: "Évaluation multicritère calculée pour chaque offre",
      topRecTitle: "Top Recommandations",
      topRecDesc: "Offres les plus pertinentes ordonnées par l'algorithme IA",
      offerLabel: "Offre",
      ctaTitle: "Prêt à évaluer vos premières offres ?",
      ctaDesc: "Définissez votre contexte de recherche en 30 secondes et laissez l'IA dénicher les pépites.",
      ctaBtn: "Lancer l'analyse maintenant",
    },
    // Search Context Page
    searchContextPage: {
      bannerTitle: "Définissez votre contexte de recherche",
      bannerDesc: "Ces paramètres permettent à l'IA de comprendre exactement vos besoins et d'ajuster le calcul des scores.",
      formTitle: "Paramètres de Recherche",
      formDesc: "Personnalisez votre domaine d'activité, critères explicites et préférences implicites",
      presetsTitle: "Exemples Rapides (1-Clic)",
      presetsClick: "Cliquez pour préremplir",
      domainLabel: "Domaine de recherche",
      domainPlaceholder: "ex. Jobs Tech, Immobilier, Véhicules...",
      domainHint: "La thématique générale des opportunités que vous ciblez",
      limitLabel: "Nombre de recommandations",
      selectLimit: "Sélectionnez le volume",
      top3: "Top 3",
      top5: "Top 5",
      top10: "Top 10",
      limitHint: "Nombre d'offres les mieux notées à retenir dans l'analyse finale",
      explicitLabel: "Critères Explicites (Exigences Strictes)",
      explicitPlaceholder: "Budget max, Localisation, Type de contrat, Salaire minimum...",
      explicitHint: "Conditions non négociables que les offres retenues doivent impérativement remplir",
      implicitLabel: "Contexte Implicite (Préférences Douces & Confort)",
      implicitPlaceholder: "Ambiance de travail, équilibre vie pro/perso, luminosité, standing...",
      implicitHint: "Priorités subjectives qui orienteront le score de pertinence et la justification IA",
      badgeRequired: "Requis",
      badgePreferences: "Préférences",
      readyNext: "Prêt à configurer votre source d'offres ?",
      btnNext: "Étape suivante : Source de Données",
      btnCancel: "Annuler",
      tipsTitle: "Conseils pour de Meilleurs Résultats",
      tip1: "Soyez précis dans les critères stricts — ils agissent comme des filtres éliminatoires.",
      tip2: "Décrivez vos attentes humaines et environnementales dans le contexte implicite.",
      tip3: "L'IA combine exigences et affinités pour ordonner le classement final.",
      presets: [
        {
          label: "Emploi Tech",
          icon: "💼",
          domain: "Jobs Tech",
          criteria: "Senior Fullstack TypeScript/React, Remote ou Paris, > 65k€",
          context: "Priorité à la flexibilité horaire, stack moderne (Next.js, Tailwind), ambiance collaborative et autonomie.",
        },
        {
          label: "Immobilier",
          icon: "🏡",
          domain: "Immobilier",
          criteria: "Appartement 3 pièces, > 60m², Budget max 450 000€, balcon",
          context: "Quartier calme, proche écoles et transports, lumineux avec bonne isolation thermique et phonique.",
        },
        {
          label: "Matériel Tech",
          icon: "💻",
          domain: "Matériel Informatique",
          criteria: "PC Portable 14-16 pouces, 32 Go RAM, SSD 1 To, autonomie > 10h, sous 1800€",
          context: "Développement web et inférence IA locale, écran haute fidélité, silencieux et châssis léger.",
        },
      ],
    },
    // Data Source Page
    dataSourcePage: {
      bannerTitle: "Configurez votre méthode d'apport des données",
      bannerDesc: "Choisissez entre l'exploration web automatisée par l'IA ou l'import manuel d'un jeu de données JSON.",
      methodTitle: "Méthode d'Alimentation",
      methodDesc: "Sélectionnez la façon dont les offres brutes sont transmises au moteur IA",
      autoFetchTitle: "Recherche Web Automatique par IA",
      autoFetchDesc: "L'IA explore automatiquement le web pour trouver des offres récentes correspondant à votre contexte",
      badgeRecommended: "Recommandé",
      badgeRealtime: "Données fraîches en temps réel",
      jsonTitle: "Saisie Manuelle en JSON",
      jsonDisabled: "Désactivé (Recherche web automatique active)",
      jsonHintEnabled: "Collez votre tableau d'offres au format JSON. Chaque élément doit inclure au moins id, title, description.",
      jsonHintDisabled: "Désactivez la recherche automatique pour saisir manuellement vos offres brutes.",
      btnBack: "Retour au Contexte",
      btnCancel: "Annuler",
      btnAnalyze: "Lancer l'Analyse IA",
      btnAnalyzing: "Recherche & Analyse en cours...",
      btnFetching: "Recherche Web en cours...",
      helpAutoTitle: "Recherche Auto (Recommandé)",
      helpAutoDesc: "Idéal pour :",
      helpAutoPoint1: "Données fraîches du marché en temps réel",
      helpAutoPoint2: "Découverte proactive de nouvelles offres",
      helpAutoPoint3: "Collecte et normalisation automatisées",
      helpJsonTitle: "Saisie JSON Manuelle",
      helpJsonDesc: "Idéal pour :",
      helpJsonPoint1: "Jeux de données déjà constitués",
      helpJsonPoint2: "Évaluation d'offres spécifiques ciblées",
      helpJsonPoint3: "Sources de données internes ou sur-mesure",
    },
    // Saved Offers Page
    savedPage: {
      title: "Offres Sauvegardées",
      description: "Votre sélection personnalisée d'offres mémorisées et comparables",
      itemSingular: "offre enregistrée",
      itemPlural: "offres enregistrées",
      selectedSingular: "sélectionnée",
      selectedPlural: "sélectionnées",
      btnCompare: "Comparer",
      btnSmartOrganize: "Organisation Intelligente",
      btnOrganizing: "Organisation...",
      emptyTitle: "Aucune offre enregistrée pour l'instant",
      emptyDesc: "Depuis les résultats d'analyse, cliquez sur le bouton de sauvegarde pour conserver les meilleures offres ici.",
      btnDiscover: "Lancer une nouvelle analyse",
      tabAll: "Toutes les offres",
      tabClusters: "Groupes Thématiques IA",
      tabTimeline: "Historique & Dates",
      tabInsights: "Synthèse Globale",
      removeTooltip: "Retirer des favoris",
      scoreLabel: "Score IA",
      toastOrganizeFailed: "Échec de l'organisation intelligente des offres",
      toastConnectionError: "Vérifiez votre connexion et réessayez.",
    },
    // Compare Page
    comparePage: {
      title: "Comparateur d'Offres",
      description: "Comparaison visuelle et analytique côte à côte de vos offres sélectionnées",
      offerNumber: "Offre #",
      scoreLabel: "Score global :",
      keyHighlights: "Indicateurs clés",
      strengths: "Points forts",
      weaknesses: "Points d'attention / Risques",
      location: "Localisation",
      btnBack: "Retour aux offres sauvegardées",
      minOffersWarning: "Veuillez sélectionner au moins 2 offres dans vos sauvegardes pour démarrer la comparaison.",
      loadingTitle: "Chargement du comparateur...",
      summaryTitle: "Synthèse de la Comparaison",
      comparingText: "Comparaison de",
      offersCountText: "offres.",
      highestScoreText: "Score le plus élevé :",
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
    // Offer Card & Detail Modal
    offer: {
      relevance: "Pertinence",
      quality: "Qualité",
      trend: "Tendance",
      webInsight: "Aperçu Web",
      save: "Sauvegarder",
      saved: "Sauvegardé",
      alreadySaved: "Offre déjà sauvegardée",
      saveThisOffer: "Sauvegarder cette offre",
      viewDetails: "Voir les détails",
      close: "Fermer",
      scoreBreakdown: "Décomposition du Score IA",
      aiJustification: "Justification de l'analyse IA",
      allWebInsights: "Signaux & Insights Web Explorés",
      fullDescription: "Description Complète de l'Offre",
      externalSource: "Consulter l'offre source",
      noSourceUrl: "Lien direct non fourni",
      rankBadge: "Rang",
      location: "Localisation",
      category: "Catégorie",
      price: "Prix estimé / affiché",
      keyHighlights: "Indicateurs clés",
    },
    // Results Section
    results: {
      title: "Top Recommandations",
      marketSummary: "Synthèse Globale du Marché",
      verifiedSources: "Sources & Citations Web Explorées",
      sourcesCount: "source(s) consultée(s)",
      noResults: "Aucun résultat d'analyse disponible. Lancez une analyse ci-dessus.",
      emptyDescription: "Configurez vos critères et lancez la recherche pour voir le classement personnalisé.",
      viewGrid: "Grille",
      viewList: "Liste",
      displayMode: "Affichage",
    },
    // Errors
    errors: {
      invalidJson: "Le format JSON des offres saisies est invalide. Veuillez vérifier la syntaxe.",
      jsonRemedy: "Corrigez la syntaxe JSON ou cochez la recherche automatique.",
      failedAnalysis: "L'analyse a échoué. Veuillez réessayer.",
    },
    auth: {
      backToApp: "Continuer en mode Invité",
      guestNotice: "Vous pouvez utiliser OfferAnalyst sans compte en mode Invité (stockage local) ou vous connecter pour synchroniser vos données dans le cloud.",
      signOut: "Se déconnecter",
      signingOut: "Déconnexion...",
      signInCta: "Se connecter / Créer un compte",
      guestUser: "Utilisateur Invité",
      clickToSignIn: "Cliquez pour vous connecter",
      loginTitle: "Bon retour",
      loginSubtitle: "Connectez-vous à votre compte OfferAnalyst",
      signupTitle: "Créer un compte",
      signupSubtitle: "Démarrez avec OfferAnalyst — Gratuit et synchronisé",
      emailLabel: "Adresse email",
      emailPlaceholder: "vous@exemple.com",
      passwordLabel: "Mot de passe",
      nameLabel: "Nom complet",
      namePlaceholder: "Jean Dupont",
      confirmPasswordLabel: "Confirmer le mot de passe",
      forgotPassword: "Mot de passe oublié ?",
      signInBtn: "Se connecter",
      signingIn: "Connexion en cours...",
      signUpBtn: "Créer mon compte",
      creatingAccount: "Création du compte...",
      orContinueWith: "Ou continuer avec",
      noAccountYet: "Vous n'avez pas encore de compte ?",
      alreadyHaveAccount: "Vous avez déjà un compte ?",
      signUpLink: "S'inscrire",
      signInLink: "Se connecter",
      passwordMinHint: "Au moins 8 caractères",
      errPasswordMismatch: "Les mots de passe ne correspondent pas.",
      errPasswordLength: "Le mot de passe doit contenir au moins 8 caractères.",
      errInvalidCredentials: "Identifiants invalides. Vérifiez votre email et votre mot de passe.",
      errSignupFailed: "Échec de la création du compte. Cet email est peut-être déjà utilisé.",
      termsAgreement: "En créant un compte, vous acceptez nos Conditions d'Utilisation et notre Politique de Confidentialité.",
    }
  },
  en: {
    // Navigation & Shell
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
      sectionMain: "Main Flow",
      sectionMore: "Navigation",
      sectionDashboard: "Dashboard",
      sectionAdmin: "Administration",
      adminConsole: "Admin Console",
      activeSession: "Active Session",
      guestSession: "Free / Guest",
      expandSidebar: "Expand sidebar",
      collapseSidebar: "Collapse sidebar",
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
    },
    // Route Meta (Header & Breadcrumbs)
    routes: {
      '/': {
        title: "Dashboard",
        description: "AI-powered offer analysis and insights",
        breadcrumbs: ["Home", "Dashboard"],
      },
      '/search-context': {
        title: "Search Context",
        description: "Define your domain, strict criteria, and soft preferences",
        breadcrumbs: ["Home", "Search Context"],
      },
      '/data-source': {
        title: "Data Source",
        description: "Configure automated web exploration or manual JSON input",
        breadcrumbs: ["Home", "Data Source"],
      },
      '/analysis': {
        title: "Analysis Results",
        description: "AI recommendations, multi-axis scoring, and market insights",
        breadcrumbs: ["Home", "Analysis"],
      },
      '/dashboard/api-keys': {
        title: "API Keys",
        description: "Manage your AI provider API keys for BYOK access",
        breadcrumbs: ["Home", "Dashboard", "API Keys"],
      },
      '/projects': {
        title: "Projects",
        description: "Manage your analysis spaces and saved queries",
        breadcrumbs: ["Home", "Projects"],
      },
      '/history': {
        title: "History",
        description: "View the chronological history of your past searches",
        breadcrumbs: ["Home", "History"],
      },
      '/saved': {
        title: "Saved Offers",
        description: "Your personalized collection of bookmarked and comparable offers",
        breadcrumbs: ["Home", "Saved Offers"],
      },
      '/compare': {
        title: "Compare Offers",
        description: "Visual side-by-side comparison of selected offers",
        breadcrumbs: ["Home", "Compare"],
      },
      '/dashboard/settings': {
        title: "Settings",
        description: "Account preferences, visual themes, and configuration",
        breadcrumbs: ["Home", "Dashboard", "Settings"],
      },
      '/dashboard/workspace': {
        title: "Workspace",
        description: "Team spaces, shared prompts, and collaboration environments",
        breadcrumbs: ["Home", "Dashboard", "Workspace"],
      },
      '/dashboard/support': {
        title: "Support & Assistance",
        description: "Contact support or sponsor future development",
        breadcrumbs: ["Home", "Dashboard", "Support"],
      },
      '/dashboard/analytics': {
        title: "Analytics & Insights",
        description: "Usage statistics, search history, and AI metrics",
        breadcrumbs: ["Home", "Dashboard", "Analytics"],
      },
      '/help': {
        title: "Help Center",
        description: "Guides, FAQs, and troubleshooting documentation",
        breadcrumbs: ["Home", "Help Center"],
      },
      '/changelog': {
        title: "Changelog",
        description: "Track new features, improvements, and bug fixes",
        breadcrumbs: ["Home", "Changelog"],
      },
      '/privacy': {
        title: "Privacy Policy",
        description: "Our commitment to data protection and user privacy",
        breadcrumbs: ["Home", "Privacy Policy"],
      },
      '/terms': {
        title: "Terms of Service",
        description: "Rules and terms governing the use of OfferAnalyst",
        breadcrumbs: ["Home", "Terms of Service"],
      },
      '/cookies': {
        title: "Cookie Preferences",
        description: "Manage tracking cookies and telemetry preferences",
        breadcrumbs: ["Home", "Cookie Preferences"],
      },
      '/admin': {
        title: "Admin Console",
        description: "Platform supervision, role management, and FinOps telemetry",
        breadcrumbs: ["Home", "Administration"],
      },
      '/onboarding': {
        title: "Initial Setup",
        description: "Customize your OfferAnalyst experience in a few quick steps",
        breadcrumbs: ["Home", "Onboarding"],
      },
      '/auth/login': {
        title: "Sign In",
        description: "Sign in to your OfferAnalyst account",
        breadcrumbs: ["Home", "Authentication", "Sign In"],
      },
      '/auth/signup': {
        title: "Create Account",
        description: "Create an account to sync your projects and API keys in the cloud",
        breadcrumbs: ["Home", "Authentication", "Sign Up"],
      },
      '/auth/reset': {
        title: "Reset Password",
        description: "Securely recover access to your account",
        breadcrumbs: ["Home", "Authentication", "Reset Password"],
      },
      '/auth/verify': {
        title: "Email Verification",
        description: "Verify your email address",
        breadcrumbs: ["Home", "Authentication", "Verification"],
      },
    },
    // Home Page
    home: {
      heroTitle: "Welcome to OfferAnalyst",
      heroSubtitle: "Real-time AI-powered contextual offer analysis and recommendations",
      cardTitle: "Get Started with AI Analysis",
      cardDescription: "Follow these steps to discover, evaluate, and rank offers based on your profile",
      badgeAI: "Advanced AI Analysis",
      badgeRanking: "Contextual Ranking",
      badgeVisualization: "Multi-Axis Scores",
      badgeRealtime: "Real-time Processing",
      workflowTitle: "Analysis Workflow",
      step1Title: "1. Define Context",
      step1Desc: "Set your domain, must-have requirements, and personal lifestyle preferences",
      step2Title: "2. Configure Source",
      step2Desc: "Choose live AI web scraping or paste your offers in raw JSON format",
      step3Title: "3. Results & Ranking",
      step3Desc: "Explore AI rankings, multidimensional score breakdowns, and web citations",
      btnGetStarted: "Get Started",
      previewTitle: "Analysis Preview",
      scoreDistTitle: "Score Distribution",
      scoreDistDesc: "Multicriteria score calculated for each opportunity",
      topRecTitle: "Top Recommendations",
      topRecDesc: "Highest-ranked offers ordered by the AI scoring model",
      offerLabel: "Offer",
      ctaTitle: "Ready to analyze your first offers?",
      ctaDesc: "Define your search context in 30 seconds and let AI unearth the best opportunities.",
      ctaBtn: "Start Analysis Now",
    },
    // Search Context Page
    searchContextPage: {
      bannerTitle: "Define your search context",
      bannerDesc: "These parameters help the AI understand your needs and calibrate scoring algorithms.",
      formTitle: "Search Parameters",
      formDesc: "Customize your industry domain, explicit requirements, and implicit preferences",
      presetsTitle: "Quick Presets (1-Click)",
      presetsClick: "Click to autofill",
      domainLabel: "Search Domain",
      domainPlaceholder: "e.g. Tech Jobs, Real Estate, Laptops...",
      domainHint: "The general category of opportunities you are looking for",
      limitLabel: "Recommendation Limit",
      selectLimit: "Select volume",
      top3: "Top 3",
      top5: "Top 5",
      top10: "Top 10",
      limitHint: "Number of top scored offers to return in the final analysis",
      explicitLabel: "Explicit Criteria (Strict Requirements)",
      explicitPlaceholder: "Budget max, Location, Contract type, Minimum salary...",
      explicitHint: "Non-negotiable conditions that selected offers must fulfill",
      implicitLabel: "Implicit Context (Soft Preferences & Comfort)",
      implicitPlaceholder: "Work atmosphere, work-life balance, natural light, prestige...",
      implicitHint: "Subjective priorities that will guide the relevance score and AI reasoning",
      badgeRequired: "Required",
      badgePreferences: "Preferences",
      readyNext: "Ready to configure your data source?",
      btnNext: "Next: Data Source",
      btnCancel: "Cancel",
      tipsTitle: "Tips for Better Results",
      tip1: "Be specific with explicit criteria - these are hard filters.",
      tip2: "Use implicit context to describe your lifestyle priorities and culture preferences.",
      tip3: "The AI combines hard filters and soft preferences to produce the final ranking.",
      presets: [
        {
          label: "Tech Jobs",
          icon: "💼",
          domain: "Tech Jobs",
          criteria: "Senior Fullstack TypeScript/React, Remote or London, > £70k",
          context: "High priority on flexible hours, modern stack (Next.js, Tailwind), collaborative culture, and autonomy.",
        },
        {
          label: "Real Estate",
          icon: "🏡",
          domain: "Real Estate",
          criteria: "2-Bedroom apartment, > 60m², Max budget £450,000, balcony",
          context: "Quiet neighborhood, near schools and transit, bright with strong thermal and sound insulation.",
        },
        {
          label: "Hardware",
          icon: "💻",
          domain: "Hardware & Laptops",
          criteria: "14-16 inch laptop, 32GB RAM, 1TB SSD, battery > 10h, under £1,600",
          context: "Web development and local AI inference, high-fidelity display, quiet fans, lightweight chassis.",
        },
      ],
    },
    // Data Source Page
    dataSourcePage: {
      bannerTitle: "Configure your data input method",
      bannerDesc: "Choose between AI-powered web exploration or manual JSON dataset input.",
      methodTitle: "Data Input Method",
      methodDesc: "Select how raw offers are provided to the AI scoring engine",
      autoFetchTitle: "Auto-Fetch Offers (AI Web Search)",
      autoFetchDesc: "AI will automatically search the web for relevant offers matching your context",
      badgeRecommended: "Recommended",
      badgeRealtime: "Real-time fresh data",
      jsonTitle: "Manual JSON Input",
      jsonDisabled: "Disabled (Auto-fetch enabled)",
      jsonHintEnabled: "Paste your offer array in JSON format. Each entry should have at least id, title, description.",
      jsonHintDisabled: "Disable auto-fetch to manually input offer data in JSON format.",
      btnBack: "Back to Context",
      btnCancel: "Cancel",
      btnAnalyze: "Run AI Analysis",
      btnAnalyzing: "Searching & Analyzing...",
      btnFetching: "Searching the Web...",
      helpAutoTitle: "Auto-Fetch (Recommended)",
      helpAutoDesc: "Perfect for:",
      helpAutoPoint1: "Real-time market data",
      helpAutoPoint2: "Discovering new offers",
      helpAutoPoint3: "Automated data collection",
      helpJsonTitle: "Manual JSON Input",
      helpJsonDesc: "Perfect for:",
      helpJsonPoint1: "Pre-collected data",
      helpJsonPoint2: "Specific offer comparison",
      helpJsonPoint3: "Custom data sources",
    },
    // Saved Offers Page
    savedPage: {
      title: "Saved Offers",
      description: "Your personalized collection of bookmarked and comparable offers",
      itemSingular: "saved offer",
      itemPlural: "saved offers",
      selectedSingular: "selected",
      selectedPlural: "selected",
      btnCompare: "Compare",
      btnSmartOrganize: "Smart Organize",
      btnOrganizing: "Organizing...",
      emptyTitle: "No saved offers yet",
      emptyDesc: "Save top recommendations from the analysis results page to review and compare them here.",
      btnDiscover: "Discover Offers",
      tabAll: "All Offers",
      tabClusters: "AI Clusters",
      tabTimeline: "Timeline",
      tabInsights: "Market Insights",
      removeTooltip: "Remove from saved",
      scoreLabel: "AI Score",
      toastOrganizeFailed: "Failed to organize offers",
      toastConnectionError: "Please check your network connection and try again.",
    },
    // Compare Page
    comparePage: {
      title: "Compare Offers",
      description: "Side-by-side visual and analytical comparison of selected offers",
      offerNumber: "Offer #",
      scoreLabel: "Overall Score:",
      keyHighlights: "Key Highlights",
      strengths: "Strengths",
      weaknesses: "Points of Attention / Risks",
      location: "Location",
      btnBack: "Back to Saved Offers",
      minOffersWarning: "Please select at least 2 saved offers to launch the comparison view.",
      loadingTitle: "Loading comparison...",
      summaryTitle: "Comparison Summary",
      comparingText: "Comparing",
      offersCountText: "offers.",
      highestScoreText: "Highest score:",
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
    // Offer Card & Detail Modal
    offer: {
      relevance: "Relevance",
      quality: "Quality",
      trend: "Trend",
      webInsight: "Web Insight",
      save: "Save",
      saved: "Saved",
      alreadySaved: "Offer already saved",
      saveThisOffer: "Save this offer",
      viewDetails: "View Details",
      close: "Close",
      scoreBreakdown: "AI Score Breakdown",
      aiJustification: "AI Analysis Justification",
      allWebInsights: "Explored Web Insights & Signals",
      fullDescription: "Full Offer Description",
      externalSource: "Open Original Listing",
      noSourceUrl: "Direct link not provided",
      rankBadge: "Rank",
      location: "Location",
      category: "Category",
      price: "Estimated / Listed Price",
      keyHighlights: "Key Highlights",
    },
    // Results Section
    results: {
      title: "Top Recommendations",
      marketSummary: "Market Summary & Insights",
      verifiedSources: "Explored Web Sources & Citations",
      sourcesCount: "source(s) consulted",
      noResults: "No analysis results available yet. Run an analysis above.",
      emptyDescription: "Set your criteria and run analysis to view personalized AI rankings.",
      viewGrid: "Grid",
      viewList: "List",
      displayMode: "Display",
    },
    // Errors
    errors: {
      invalidJson: "Invalid JSON format for offers. Please check your syntax.",
      jsonRemedy: "Fix the JSON syntax or enable Auto-Fetch.",
      failedAnalysis: "Analysis failed. Please try again.",
    },
    auth: {
      backToApp: "Continue as Guest",
      guestNotice: "You can use OfferAnalyst without an account in Guest mode (local storage) or sign in to sync your data in the cloud.",
      signOut: "Sign Out",
      signingOut: "Signing out...",
      signInCta: "Sign In / Create Account",
      guestUser: "Guest User",
      clickToSignIn: "Click to Sign In",
      loginTitle: "Welcome Back",
      loginSubtitle: "Sign in to your OfferAnalyst account",
      signupTitle: "Create an Account",
      signupSubtitle: "Get started with OfferAnalyst — Free & cloud-synced",
      emailLabel: "Email Address",
      emailPlaceholder: "you@example.com",
      passwordLabel: "Password",
      nameLabel: "Full Name",
      namePlaceholder: "John Doe",
      confirmPasswordLabel: "Confirm Password",
      forgotPassword: "Forgot password?",
      signInBtn: "Sign In",
      signingIn: "Signing in...",
      signUpBtn: "Create Account",
      creatingAccount: "Creating account...",
      orContinueWith: "Or continue with",
      noAccountYet: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
      signUpLink: "Sign up",
      signInLink: "Sign in",
      passwordMinHint: "Must be at least 8 characters",
      errPasswordMismatch: "Passwords do not match.",
      errPasswordLength: "Password must be at least 8 characters.",
      errInvalidCredentials: "Invalid credentials. Please check your email and password.",
      errSignupFailed: "Failed to create account. This email may already be in use.",
      termsAgreement: "By creating an account, you agree to our Terms of Service and Privacy Policy.",
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

export type TranslationDictionary = typeof translations.fr;

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
