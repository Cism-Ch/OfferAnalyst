"use client";

/**
 * Unified Search History Hook
 * 
 * Alias module providing useUnifiedSearchHistory, maintaining 100% interoperability
 * with useSearchHistory while offering explicit dual-storage naming.
 */

export {
  useSearchHistory as useUnifiedSearchHistory,
  useSearchHistory,
  purgeExpiredGuestItems,
  GUEST_HISTORY_KEY,
  LEGACY_HISTORY_KEY,
  GUEST_RETENTION_MS,
} from "./use-search-history";

export { default } from "./use-search-history";
