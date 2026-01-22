'use client';

/**
 * Web Vitals Tracker Component
 * Tracks Core Web Vitals metrics and sends them to the analytics service
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function WebVitalsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'true') {
      return;
    }

    // Dynamic import of web-vitals to reduce bundle size
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      const reportMetric = async (metric: { name: string; value: number; rating: string }) => {
        try {
          // Send metric to analytics endpoint
          await fetch('/api/analytics/web-vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: metric.name,
              value: metric.value,
              rating: metric.rating,
              path: pathname,
            }),
          });
        } catch (error) {
          // Silent fail - don't disrupt user experience
          console.debug('Failed to report web vitals:', error);
        }
      };

      // Track all Core Web Vitals
      onCLS(reportMetric);
      onFCP(reportMetric);
      onLCP(reportMetric);
      onTTFB(reportMetric);
      onINP(reportMetric);
    });
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
