/**
 * Client-safe types and default constants for dynamic platform configuration.
 * Separated from src/lib/platform-config.ts to prevent bundling Prisma/pg into Client Components.
 */

export type TavilyAdminSlot = 'auto' | 'primary' | 'secondary';

export interface PlatformQuotaConfig {
  freeTierDailyQuota: number;
  quotaBannerEnabled: boolean;
  quotaBannerMessageFr: string;
  quotaBannerMessageEn: string;
  tavilyActiveAdminSlot: TavilyAdminSlot;
  tavilyPrimaryCreditsUsed: number;
  tavilySecondaryCreditsUsed: number;
}

export const DEFAULT_PLATFORM_CONFIG: PlatformQuotaConfig = {
  freeTierDailyQuota: 5,
  quotaBannerEnabled: true,
  quotaBannerMessageFr:
    "Quota Free Tier fixé à 5 recherches/jour (les recherches web avancées consomment 2 crédits Tavily). Créez un compte gratuit sur tavily.com pour obtenir 1 000 crédits/mois avec votre propre clé API.",
  quotaBannerMessageEn:
    'Free Tier quota is set to 5 searches/day (advanced web searches consume 2 Tavily credits). Create a free account at tavily.com to get 1,000 free monthly credits with your own API key.',
  tavilyActiveAdminSlot: 'auto',
  tavilyPrimaryCreditsUsed: 0,
  tavilySecondaryCreditsUsed: 0,
};
