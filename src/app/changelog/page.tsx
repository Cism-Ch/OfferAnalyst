'use client';

/**
 * Changelog Page — OfferAnalyst Timeline
 * Displays official release history, technical innovations, and architecture upgrades.
 * Strictly adheres to zero-emoji policy and responsive mobile-first standards.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles, Shield, TrendingUp, Cpu, Server, Zap, Globe, Layers } from 'lucide-react';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  tagline: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    category: 'features' | 'improvements' | 'fixes' | 'security';
    items: string[];
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: '1.4.5',
    date: '3 Novembre 2026',
    title: 'Multi-Tenant Workspace Visibility & Sidebar Ergonomics',
    tagline: 'Affichage proéminent du workspace actif, dédoublonnage de navigation et fiabilisation des compteurs.',
    type: 'patch',
    changes: [
      {
        category: 'features',
        items: [
          'Badge dynamique du Workspace actif intégré dans le Header (desktop/mobile) et la Sidebar',
          'Accès direct en 1 clic vers les réglages et l\'invitation de collaborateurs (/dashboard/workspace)',
          'Refonte de la page Changelog avec timeline synchronisée jusqu\'au Sprint 47',
        ],
      },
      {
        category: 'improvements',
        items: [
          'Harmonisation des sections de la Sidebar : Groupe 1 « Recherche », Groupe 2 « Espace de travail », Groupe 3 « Gestion & Paramètres »',
          'Recalibrage spatial de la modal du Sélecteur d\'IA (h-[92dvh] / sm:h-[86dvh]) avec footer sans débordement',
          'Événement natif offeranalyst:quota_updated pour actualisation instantanée du badge quota à chaque analyse',
        ],
      },
      {
        category: 'fixes',
        items: [
          'Suppression du doublon de libellé « Tableau de bord » entre la page d\'accueil et la page analytiques',
          'Résolution des marges négatives parasites qui tronquaient le footer du sélecteur de modèles sur mobile',
        ],
      },
    ],
  },
  {
    version: '1.4.2',
    date: '2 Novembre 2026',
    title: 'Upstash Redis Rate-Limiting & DDoS Adaptive Defense',
    tagline: 'Bouclier de sécurité Upstash Redis, sonde de santé multi-services et catalogue 40 composants shadcn.',
    type: 'minor',
    changes: [
      {
        category: 'security',
        items: [
          'DDoS Adaptive Defense calibré à 5 req/min par IP avec isolement automatique en quarantaine de 15 min',
          'Télémétrie en direct dans le Dashboard Admin (/admin) surveillant MongoDB Atlas, Redis, QStash et OpenRouter',
          'Déblocage d\'IP malveillante ou bloquée en 1 clic depuis le centre de sécurité',
        ],
      },
      {
        category: 'features',
        items: [
          'Installation complète du catalogue de 40 composants officiels shadcn/ui et Radix UI',
          'Intégration des serveurs MCP officiels Upstash et Tigris avec 32 skills spécialisés',
          'Support BYOK multi-sources (Session Better-Auth, cookie chiffré 24h AES-256-GCM et clés locales)',
        ],
      },
      {
        category: 'improvements',
        items: [
          'Règles d\'ingénierie AGENTS.md enrichies : Mobile-First strict, touch targets 44x44px et safe-area insets',
          'Purge intégrale du code mort des anciens Feature Flags au profit de la télémétrie temps réel',
        ],
      },
    ],
  },
  {
    version: '1.4.0',
    date: '28 Octobre 2026',
    title: 'Model Engine Refresh & Offline Availability Detection',
    tagline: 'Sélection IA structurée (2 modèles par fournisseur), surveillance d\'état et modèle NVIDIA Gratuit solo.',
    type: 'minor',
    changes: [
      {
        category: 'features',
        items: [
          'Mise à jour des modèles IA de pointe : GPT-6.1 Terra, Claude 5.5 Sonnet, DeepSeek V3/R1, Gemini 3.8 Flash',
          'NVIDIA Nemotron 3.5 Lightning configuré comme modèle gratuit unique par défaut pour un scoring stable',
          'Détection automatique de disponibilité et marquage Hors-Ligne en direct via l\'API OpenRouter',
        ],
      },
      {
        category: 'improvements',
        items: [
          'Affichage proéminent du modèle d\'inférence utilisé sur chaque carte de résultats et d\'historique',
          'Modal de détails grand format (max-w-4xl) pour explorer les résultats d\'analyse sans compression',
        ],
      },
      {
        category: 'security',
        items: [
          'Bookmarklet de capture 1-clic natif sécurisé sans fuite de token ni risque d\'injection',
          'Validation stricte des entrées utilisateur via Zod avant tout envoi vers le moteur d\'analyse',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: '15 Octobre 2026',
    title: 'B2B Multi-Tenancy & SaaS Showcase Experience',
    tagline: 'Espaces de travail partagés avec rôles RBAC et vitrine produit immersive.',
    type: 'major',
    changes: [
      {
        category: 'features',
        items: [
          'Architecture multi-tenancy avec modèles Workspace et WorkspaceMember dans MongoDB Atlas',
          'Gestion des rôles collaboratifs (Propriétaire, Administrateur, Membre, Observateur)',
          'Page de présentation SaaS interactive (/landing) avec démonstrations en direct et calculateurs de ROI',
        ],
      },
      {
        category: 'improvements',
        items: [
          'Système de thèmes Jewel avec transitions fluides Framer Motion',
          'Support bilingue intégral Français / Anglais sur l\'ensemble des modules applicatifs',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '1 Octobre 2026',
    title: 'Production Launch & Core Foundation',
    tagline: 'Lancement officiel du moteur de scoring et d\'analyse contextuelle d\'offres par IA.',
    type: 'major',
    changes: [
      {
        category: 'features',
        items: [
          'Pipeline d\'analyse sémantique multi-critères avec scoring pondéré sur 100',
          'Authentification moderne côté serveur avec Better-Auth',
          'Support d\'ingestion multi-sources : texte brut, URLs, fichiers documents et format JSON',
        ],
      },
      {
        category: 'security',
        items: [
          'Chiffrement AES-256-GCM des clés API temporaires en cookie sécurisé HttpOnly',
          'Strict TypeScript à 100% et couverture de validation déterministe',
        ],
      },
    ],
  },
];

const categoryConfig = {
  features: {
    icon: Sparkles,
    label: 'Nouvelles Fonctionnalités',
    badgeClass: 'bg-primary/10 text-primary border-primary/20',
    iconClass: 'text-primary',
  },
  improvements: {
    icon: TrendingUp,
    label: 'Améliorations & Performance',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    iconClass: 'text-emerald-500',
  },
  fixes: {
    icon: CheckCircle2,
    label: 'Corrections & Stabilité',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    iconClass: 'text-amber-500',
  },
  security: {
    icon: Shield,
    label: 'Sécurité & Infrastructure',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    iconClass: 'text-rose-500',
  },
};

const typeBadgeConfig = {
  major: { label: 'Version Majeure', class: 'bg-primary text-primary-foreground font-bold' },
  minor: { label: 'Mise à Jour', class: 'bg-accent text-accent-foreground border border-border/80' },
  patch: { label: 'Correctif & Polissage', class: 'bg-muted text-muted-foreground border border-border/60' },
};

export default function ChangelogPage() {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  return (
    <SimpleLayout
      title={isFr ? "Journal des Mises à Jour" : "Product Changelog"}
      description={isFr ? "Historique des versions, évolutions techniques et nouvelles fonctionnalités de la plateforme OfferAnalyst." : "Release history, technical architecture updates, and feature rollouts."}
      maxWidth="5xl"
    >
      <div className="space-y-8 pb-10">
        {/* Intro Highlight Banner */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-6 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {isFr ? "Version Actuelle de Production :" : "Current Production Version:"} <span className="text-primary font-mono ml-1">v1.4.5</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isFr ? "Architecture Next.js 16, React 19, MongoDB Atlas, Upstash Redis & Multi-Tenancy." : "Built on Next.js 16, React 19, MongoDB Atlas, Upstash Redis & Multi-Tenancy."}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold rounded-full border-primary/40 text-primary shrink-0">
            {isFr ? "Dernier déploiement : Novembre 2026" : "Latest release: November 2026"}
          </Badge>
        </div>

        {/* Timeline of Releases */}
        <div className="space-y-6">
          {changelogData.map((entry) => {
            const typeInfo = typeBadgeConfig[entry.type];

            return (
              <Card key={entry.version} className="overflow-hidden border-border/70 bg-card/70 backdrop-blur-md shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
                <CardHeader className="border-b border-border/60 bg-muted/20 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <CardTitle className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
                          v{entry.version}
                        </CardTitle>
                        <Badge className={cn("text-[10px] sm:text-xs uppercase tracking-wider px-2 py-0.5 rounded-md", typeInfo.class)}>
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground/90">
                        {entry.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {entry.tagline}
                      </p>
                    </div>

                    <div className="text-xs font-medium text-muted-foreground bg-background/80 border border-border/60 px-3 py-1.5 rounded-full shrink-0 self-start sm:self-center">
                      {entry.date}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-5">
                  {entry.changes.map((group) => {
                    const catInfo = categoryConfig[group.category];
                    const IconComponent = catInfo.icon;

                    return (
                      <div key={group.category} className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <IconComponent className={cn("h-4 w-4 shrink-0", catInfo.iconClass)} />
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground/80">
                            {catInfo.label}
                          </span>
                        </div>
                        <ul className="grid grid-cols-1 gap-2 pl-6">
                          {group.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="text-xs sm:text-sm text-muted-foreground list-disc marker:text-primary leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </SimpleLayout>
  );
}
