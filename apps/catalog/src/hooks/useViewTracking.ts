// =============================================================================
// useViewTracking Hook
// =============================================================================
// React hook for tracking product view events using Intersection Observer API.
// Implements debouncing to prevent duplicate events (1 view per product per session).
// =============================================================================

import { useEffect, useRef } from 'react';

// =============================================================================
// Types
// =============================================================================

interface UseViewTrackingOptions {
  tenantId: string;
  productId: string;
  enabled?: boolean;
  threshold?: number;
}

// =============================================================================
// Session Storage Key
// =============================================================================

const VIEWED_PRODUCTS_KEY = 'viewedProducts';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if product has already been viewed in this session
 */
function hasBeenViewed(productId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const viewedProducts = sessionStorage.getItem(VIEWED_PRODUCTS_KEY);
    if (!viewedProducts) return false;

    const viewedSet = new Set<string>(JSON.parse(viewedProducts));
    return viewedSet.has(productId);
  } catch {
    return false;
  }
}

/**
 * Mark product as viewed in session storage
 */
function markAsViewed(productId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const viewedProducts = sessionStorage.getItem(VIEWED_PRODUCTS_KEY);
    const viewedSet = viewedProducts
      ? new Set<string>(JSON.parse(viewedProducts))
      : new Set<string>();

    viewedSet.add(productId);
    sessionStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify([...viewedSet]));
  } catch (error) {
    console.error('Failed to mark product as viewed:', error);
  }
}

/**
 * Track view event via API
 */
async function trackViewEvent(
  tenantId: string,
  productId: string
): Promise<void> {
  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenantId,
        productId,
        eventType: 'view',
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to track view event:', response.statusText);
    }
  } catch (error) {
    // Fire-and-forget: don't block user experience on tracking errors
    console.error('Error tracking view event:', error);
  }
}

// =============================================================================
// useViewTracking Hook
// =============================================================================

/**
 * Track when a product card becomes visible in the viewport.
 * Uses Intersection Observer API for efficient detection.
 * Implements session-based deduplication (1 view per product per session).
 *
 * @param options - Configuration options
 * @returns Ref to attach to the element to track
 *
 * @example
 * ```tsx
 * function ProductCard({ product, tenant }: ProductCardProps) {
 *   const trackingRef = useViewTracking({
 *     tenantId: tenant.id,
 *     productId: product.id,
 *     enabled: product.isAvailable,
 *   });
 *
 *   return <div ref={trackingRef}>...</div>;
 * }
 * ```
 */
export function useViewTracking<T extends HTMLElement = HTMLDivElement>(
  options: UseViewTrackingOptions
) {
  const { tenantId, productId, enabled = true, threshold = 0.5 } = options;

  const elementRef = useRef<T>(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    // Skip if disabled or already tracked in this session
    if (!enabled || hasBeenViewed(productId)) {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    // Check if Intersection Observer is supported
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
      return;
    }

    // Create observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Check if element is visible (>50% by default)
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= threshold &&
            !hasTrackedRef.current
          ) {
            // Mark as tracked to prevent duplicate calls
            hasTrackedRef.current = true;
            markAsViewed(productId);

            // Track the view event (fire-and-forget)
            trackViewEvent(tenantId, productId);
          }
        });
      },
      {
        threshold,
        // Optional: set rootMargin to trigger slightly before entering viewport
        // rootMargin: '50px',
      }
    );

    // Start observing
    observer.observe(element);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [tenantId, productId, enabled, threshold]);

  return elementRef;
}
