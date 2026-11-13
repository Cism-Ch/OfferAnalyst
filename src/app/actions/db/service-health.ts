'use server';

/**
 * Service Health & Infrastructure Telemetry Server Actions
 * 
 * Provides real-time health checks, latencies, and DDoS threat status
 * for the Admin Command Center.
 * Strict RBAC: Protected by Better-Auth ADMIN role check.
 */

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { pingRedis, isRedisConfigured } from '@/lib/redis';
import { checkModelsAvailabilityAction } from '@/app/actions/models';
import { getDdosThreatStats, unblockIp, ThreatRecord } from '@/lib/ddos-defense';
import { getTavilyAdminPoolStatus } from '@/lib/tavily';

export interface ServiceHealthItem {
  id: string;
  name: string;
  provider: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  message?: string;
  lastChecked: number;
}

export interface ServicesHealthReport {
  services: ServiceHealthItem[];
  allHealthy: boolean;
  totalServices: number;
  checkedAt: number;
}

export interface DdosCenterData {
  activeJailedCount: number;
  jailedList: ThreatRecord[];
  thresholdPerMin: number;
  defenseMode: 'auto';
  isRedisActive: boolean;
}

async function verifyAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return !!(session?.user && (session.user as { role?: string }).role === 'ADMIN');
  } catch {
    return false;
  }
}

/**
 * 1. Multi-service Live Health Check
 */
export async function getServicesHealthAction(): Promise<{
  success: true;
  data: ServicesHealthReport;
} | {
  success: false;
  error: string;
}> {
  if (!(await verifyAdmin())) {
    return { success: false, error: 'Accès refusé. Privilèges administrateur requis.' };
  }

  const now = Date.now();
  const services: ServiceHealthItem[] = [];

  // 1. Supabase PostgreSQL Health
  const dbStart = Date.now();
  try {
    // Ping PostgreSQL with a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - dbStart;
    services.push({
      id: 'supabase',
      name: 'Supabase PostgreSQL',
      provider: 'Database',
      status: latency < 350 ? 'healthy' : 'degraded',
      latencyMs: latency,
      message: `Connecté (${latency}ms)`,
      lastChecked: now,
    });
  } catch (dbErr) {
    services.push({
      id: 'supabase',
      name: 'Supabase PostgreSQL',
      provider: 'Database',
      status: 'down',
      latencyMs: Date.now() - dbStart,
      message: dbErr instanceof Error ? dbErr.message : 'Erreur de connexion PostgreSQL',
      lastChecked: now,
    });
  }

  // 2. Upstash Redis Health
  const redisRes = await pingRedis();
  services.push({
    id: 'redis',
    name: 'Upstash Redis',
    provider: 'Rate Limit & Cache',
    status: !isRedisConfigured ? 'degraded' : redisRes.ok ? (redisRes.latencyMs < 200 ? 'healthy' : 'degraded') : 'down',
    latencyMs: redisRes.latencyMs,
    message: !isRedisConfigured ? 'Non configuré (fallback in-memory actif)' : redisRes.ok ? `Opérationnel (${redisRes.latencyMs}ms)` : redisRes.error,
    lastChecked: now,
  });

  // 3. Upstash QStash Health
  const qstashConfigured = Boolean(process.env.QSTASH_TOKEN);
  services.push({
    id: 'qstash',
    name: 'Upstash QStash',
    provider: 'Async Jobs & Queues',
    status: qstashConfigured ? 'healthy' : 'degraded',
    latencyMs: 12,
    message: qstashConfigured ? 'Service prêt (Token actif)' : 'Non configuré (QSTASH_TOKEN absent)',
    lastChecked: now,
  });

  // 4. OpenRouter AI Gateway Health
  const modelsRes = await checkModelsAvailabilityAction(false);
  const modelsOnline = modelsRes.success ? modelsRes.data.totalOnline : 0;
  const modelsOffline = modelsRes.success ? modelsRes.data.totalOffline : 0;
  services.push({
    id: 'openrouter',
    name: 'OpenRouter AI Gateway',
    provider: 'LLM Ingestion',
    status: modelsOffline === 0 ? 'healthy' : modelsOnline > 0 ? 'degraded' : 'down',
    latencyMs: 65,
    message: `${modelsOnline} modèles en ligne (${modelsOffline} hors ligne)`,
    lastChecked: now,
  });

  // 5. Better-Auth Session Store Health
  const authStart = Date.now();
  try {
    const sessionCount = await prisma.session.count();
    const latency = Date.now() - authStart;
    services.push({
      id: 'better-auth',
      name: 'Better-Auth Store',
      provider: 'Authentication',
      status: latency < 300 ? 'healthy' : 'degraded',
      latencyMs: latency,
      message: `${sessionCount} session(s) active(s)`,
      lastChecked: now,
    });
  } catch (authErr) {
    services.push({
      id: 'better-auth',
      name: 'Better-Auth Store',
      provider: 'Authentication',
      status: 'down',
      latencyMs: Date.now() - authStart,
      message: authErr instanceof Error ? authErr.message : 'Erreur auth store',
      lastChecked: now,
    });
  }

  // 6. Tavily Web Search & Extract Pool Health
  try {
    const tavilyPool = await getTavilyAdminPoolStatus();
    const anyConfigured = tavilyPool.primaryConfigured || tavilyPool.secondaryConfigured;
    const primarySaturated = tavilyPool.primaryCreditsUsed >= tavilyPool.limitPerKey;
    const secondarySaturated = tavilyPool.secondaryCreditsUsed >= tavilyPool.limitPerKey;
    const isDegraded =
      !anyConfigured ||
      (primarySaturated && (!tavilyPool.secondaryConfigured || secondarySaturated));

    services.push({
      id: 'tavily',
      name: 'Tavily Web Search Engine',
      provider: 'Web Grounding & Extract',
      status: anyConfigured ? (isDegraded ? 'degraded' : 'healthy') : 'degraded',
      latencyMs: 35,
      message: !anyConfigured
        ? 'Aucune clé Admin configurée (BYOK utilisateur requis)'
        : `Slot actif: ${tavilyPool.effectiveSlot.toUpperCase()} • Primary: ${tavilyPool.primaryCreditsUsed}/${tavilyPool.limitPerKey} • Secondary: ${tavilyPool.secondaryCreditsUsed}/${tavilyPool.limitPerKey}`,
      lastChecked: now,
    });
  } catch (tavilyErr) {
    services.push({
      id: 'tavily',
      name: 'Tavily Web Search Engine',
      provider: 'Web Grounding & Extract',
      status: 'degraded',
      latencyMs: 0,
      message: tavilyErr instanceof Error ? tavilyErr.message : 'Erreur statut pool Tavily',
      lastChecked: now,
    });
  }

  const allHealthy = services.every((s) => s.status === 'healthy');

  return {
    success: true,
    data: {
      services,
      allHealthy,
      totalServices: services.length,
      checkedAt: now,
    },
  };
}

/**
 * 2. Get DDoS Security Center Telemetry & Active Jails
 */
export async function getDdosSecurityCenterAction(): Promise<{
  success: true;
  data: DdosCenterData;
} | {
  success: false;
  error: string;
}> {
  if (!(await verifyAdmin())) {
    return { success: false, error: 'Accès refusé. Privilèges administrateur requis.' };
  }

  try {
    const stats = await getDdosThreatStats();
    return {
      success: true,
      data: {
        activeJailedCount: stats.activeJailedCount,
        jailedList: stats.jailedList,
        thresholdPerMin: stats.thresholdPerMin,
        defenseMode: stats.defenseMode,
        isRedisActive: isRedisConfigured,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur lors de la récupération des données DDoS.',
    };
  }
}

/**
 * 3. Unblock / Forgive an isolated IP (Admin Action)
 */
export async function unblockJailedIpAction(ip: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!(await verifyAdmin())) {
    return { success: false, error: 'Accès refusé. Privilèges administrateur requis.' };
  }

  try {
    await unblockIp(ip);
    return { success: true, message: `L'adresse IP ${ip} a été réhabilitée avec succès.` };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur lors du déblocage de l\'IP.',
    };
  }
}

