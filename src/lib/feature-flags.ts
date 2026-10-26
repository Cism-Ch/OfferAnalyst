/**
 * Feature Flags Management
 * 
 * In-memory feature flag system with support for dynamic toggling.
 */

export interface FeatureFlags {
  fetchV2: boolean;
  organizeV2: boolean;
  dualWorkflow: boolean;
  newAnalytics: boolean;
  enableWebhooks: boolean;
  enableCache: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  fetchV2: true,
  organizeV2: true,
  dualWorkflow: true,
  newAnalytics: true,
  enableWebhooks: true,
  enableCache: true,
};

const flags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };

/**
 * Get all current feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  return { ...flags };
}

/**
 * Check if a specific feature flag is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return !!flags[flag];
}

/**
 * Update a specific feature flag
 */
export function updateFeatureFlag(flag: keyof FeatureFlags, enabled: boolean): FeatureFlags {
  flags[flag] = enabled;
  return { ...flags };
}

/**
 * Reset all feature flags to defaults
 */
export function resetFeatureFlags(): FeatureFlags {
  Object.assign(flags, DEFAULT_FEATURE_FLAGS);
  return { ...flags };
}
