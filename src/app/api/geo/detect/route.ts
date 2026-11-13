import { NextRequest, NextResponse } from 'next/server';
import { getCountryOption, inferCountryFromLocaleOrTimezone, normalizeCountryCode } from '@/lib/geo';
import { getCache, setCache } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface GeoDetectResult {
  countryCode: string;
  countryNameFr: string;
  countryNameEn: string;
  flag: string;
  source: 'vercel-header' | 'cloudflare-header' | 'ipapi' | 'accept-language' | 'default';
}

/**
 * GDPR/RGPD-compliant country detection endpoint.
 * Never persists raw user IP addresses; resolves only an ISO-3166 country code.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Edge CDN / Proxy geolocation headers (0ms, zero external call)
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    if (vercelCountry && vercelCountry.trim().length === 2 && vercelCountry !== 'XX') {
      const code = normalizeCountryCode(vercelCountry);
      const opt = getCountryOption(code);
      return NextResponse.json({
        countryCode: opt.code,
        countryNameFr: opt.labelFr,
        countryNameEn: opt.labelEn,
        flag: opt.flag,
        source: 'vercel-header',
      } satisfies GeoDetectResult);
    }

    const cfCountry = request.headers.get('cf-ipcountry');
    if (cfCountry && cfCountry.trim().length === 2 && cfCountry !== 'XX') {
      const code = normalizeCountryCode(cfCountry);
      const opt = getCountryOption(code);
      return NextResponse.json({
        countryCode: opt.code,
        countryNameFr: opt.labelFr,
        countryNameEn: opt.labelEn,
        flag: opt.flag,
        source: 'cloudflare-header',
      } satisfies GeoDetectResult);
    }

    // 2. Fallback IP lookup (for local/non-Vercel servers) with 24h cache keyed only by ephemeral hash
    const forwardedIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '';
    const isPrivateOrLocal =
      !forwardedIp ||
      forwardedIp === '127.0.0.1' ||
      forwardedIp === '::1' ||
      forwardedIp.startsWith('192.168.') ||
      forwardedIp.startsWith('10.');

    const cacheKey = `geo:detect:${isPrivateOrLocal ? 'self' : forwardedIp}`;
    const cached = await getCache<GeoDetectResult>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    try {
      const targetUrl = isPrivateOrLocal
        ? 'https://ipapi.co/json/'
        : `https://ipapi.co/${encodeURIComponent(forwardedIp)}/json/`;
      const res = await fetch(targetUrl, {
        signal: AbortSignal.timeout(1500),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = (await res.json()) as { country_code?: string; error?: boolean };
        if (!json.error && json.country_code && json.country_code.length === 2) {
          const opt = getCountryOption(json.country_code);
          const payload: GeoDetectResult = {
            countryCode: opt.code,
            countryNameFr: opt.labelFr,
            countryNameEn: opt.labelEn,
            flag: opt.flag,
            source: 'ipapi',
          };
          await setCache(cacheKey, payload, 24 * 60 * 60);
          return NextResponse.json(payload);
        }
      }
    } catch {
      // Timeout or network unavailability falls through to Accept-Language inference
    }

    // 3. Accept-Language header fallback
    const acceptLang = request.headers.get('accept-language')?.split(',')[0]?.trim();
    if (acceptLang) {
      const inferred = inferCountryFromLocaleOrTimezone(acceptLang);
      if (inferred !== 'INTL') {
        const opt = getCountryOption(inferred);
        return NextResponse.json({
          countryCode: opt.code,
          countryNameFr: opt.labelFr,
          countryNameEn: opt.labelEn,
          flag: opt.flag,
          source: 'accept-language',
        } satisfies GeoDetectResult);
      }
    }

    const intl = getCountryOption('INTL');
    return NextResponse.json({
      countryCode: intl.code,
      countryNameFr: intl.labelFr,
      countryNameEn: intl.labelEn,
      flag: intl.flag,
      source: 'default',
    } satisfies GeoDetectResult);
  } catch {
    const intl = getCountryOption('INTL');
    return NextResponse.json({
      countryCode: intl.code,
      countryNameFr: intl.labelFr,
      countryNameEn: intl.labelEn,
      flag: intl.flag,
      source: 'default',
    } satisfies GeoDetectResult);
  }
}
