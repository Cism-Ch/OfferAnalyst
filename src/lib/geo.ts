/**
 * Geographic Localization & Country Metadata (GDPR / RGPD Compliant)
 *
 * Centralizes supported countries, ISO-3166 codes, Tavily search country hints,
 * and normalized map coordinates (used solely for country-level aggregation).
 */

export interface CountryOption {
  code: string;
  labelFr: string;
  labelEn: string;
  flag: string;
  tavilyCountry?: string;
  lat: number;
  lng: number;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: 'INTL', labelFr: 'International (Global)', labelEn: 'International (Global)', flag: '🌍', lat: 20, lng: 0 },
  { code: 'FR', labelFr: 'France', labelEn: 'France', flag: '🇫🇷', tavilyCountry: 'france', lat: 46.2, lng: 2.2 },
  { code: 'CI', labelFr: "Côte d'Ivoire", labelEn: 'Ivory Coast', flag: '🇨🇮', tavilyCountry: 'ivory coast', lat: 7.5, lng: -5.5 },
  { code: 'SN', labelFr: 'Sénégal', labelEn: 'Senegal', flag: '🇸🇳', tavilyCountry: 'senegal', lat: 14.5, lng: -14.4 },
  { code: 'CM', labelFr: 'Cameroun', labelEn: 'Cameroon', flag: '🇨🇲', tavilyCountry: 'cameroon', lat: 7.3, lng: 12.3 },
  { code: 'MA', labelFr: 'Maroc', labelEn: 'Morocco', flag: '🇲🇦', tavilyCountry: 'morocco', lat: 31.8, lng: -7.1 },
  { code: 'TN', labelFr: 'Tunisie', labelEn: 'Tunisia', flag: '🇹🇳', tavilyCountry: 'tunisia', lat: 33.9, lng: 9.5 },
  { code: 'DZ', labelFr: 'Algérie', labelEn: 'Algeria', flag: '🇩🇿', tavilyCountry: 'algeria', lat: 28.0, lng: 1.6 },
  { code: 'BE', labelFr: 'Belgique', labelEn: 'Belgium', flag: '🇧🇪', tavilyCountry: 'belgium', lat: 50.5, lng: 4.5 },
  { code: 'CH', labelFr: 'Suisse', labelEn: 'Switzerland', flag: '🇨🇭', tavilyCountry: 'switzerland', lat: 46.8, lng: 8.2 },
  { code: 'CA', labelFr: 'Canada', labelEn: 'Canada', flag: '🇨🇦', tavilyCountry: 'canada', lat: 56.1, lng: -106.3 },
  { code: 'US', labelFr: 'États-Unis', labelEn: 'United States', flag: '🇺🇸', tavilyCountry: 'united states', lat: 37.1, lng: -95.7 },
  { code: 'GB', labelFr: 'Royaume-Uni', labelEn: 'United Kingdom', flag: '🇬🇧', tavilyCountry: 'united kingdom', lat: 55.4, lng: -3.4 },
  { code: 'DE', labelFr: 'Allemagne', labelEn: 'Germany', flag: '🇩🇪', tavilyCountry: 'germany', lat: 51.2, lng: 10.4 },
  { code: 'ES', labelFr: 'Espagne', labelEn: 'Spain', flag: '🇪🇸', tavilyCountry: 'spain', lat: 40.5, lng: -3.7 },
  { code: 'IT', labelFr: 'Italie', labelEn: 'Italy', flag: '🇮🇹', tavilyCountry: 'italy', lat: 41.9, lng: 12.6 },
  { code: 'AE', labelFr: 'Émirats Arabes Unis', labelEn: 'United Arab Emirates', flag: '🇦🇪', tavilyCountry: 'united arab emirates', lat: 23.4, lng: 53.8 },
];

const COUNTRY_BY_CODE = new Map<string, CountryOption>(
  SUPPORTED_COUNTRIES.map((c) => [c.code.toUpperCase(), c])
);

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Europe/Paris': 'FR',
  'Africa/Abidjan': 'CI',
  'Africa/Dakar': 'SN',
  'Africa/Douala': 'CM',
  'Africa/Casablanca': 'MA',
  'Africa/Tunis': 'TN',
  'Africa/Algiers': 'DZ',
  'Europe/Brussels': 'BE',
  'Europe/Zurich': 'CH',
  'America/Toronto': 'CA',
  'America/Montreal': 'CA',
  'America/Vancouver': 'CA',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Asia/Dubai': 'AE',
};

/**
 * Normalize any raw country string or ISO-2 code into a known code or uppercase ISO-2.
 */
export function normalizeCountryCode(code?: string | null): string {
  if (!code) return 'INTL';
  const cleaned = code.trim().toUpperCase();
  if (!cleaned || cleaned === 'GLOBAL' || cleaned === 'WORLD' || cleaned === 'ALL') {
    return 'INTL';
  }
  return cleaned;
}

/**
 * Retrieve country metadata for a given code; falls back gracefully for extra ISO codes.
 */
export function getCountryOption(code?: string | null): CountryOption {
  const normalized = normalizeCountryCode(code);
  const existing = COUNTRY_BY_CODE.get(normalized);
  if (existing) return existing;

  return {
    code: normalized,
    labelFr: normalized,
    labelEn: normalized,
    flag: '🏳️',
    lat: 20,
    lng: 0,
  };
}

/**
 * Best-effort client-side inference from browser locale & timezone when edge IP headers are absent.
 */
export function inferCountryFromLocaleOrTimezone(locale?: string, tz?: string): string {
  if (tz && TIMEZONE_TO_COUNTRY[tz]) {
    return TIMEZONE_TO_COUNTRY[tz];
  }
  if (locale) {
    const parts = locale.split(/[-_]/);
    if (parts.length >= 2) {
      const region = parts[1].toUpperCase();
      if (COUNTRY_BY_CODE.has(region)) {
        return region;
      }
    }
    if (locale.toLowerCase().startsWith('fr')) return 'FR';
  }
  return 'INTL';
}
