// =============================================================================
// Stores (Platform Overview) Hook
// =============================================================================
// React Query hook for Super Admin stores overview
// =============================================================================

import { useQuery } from '@tanstack/react-query';

// =============================================================================
// Types
// =============================================================================
export interface StoreWithMetrics {
  id: string;
  name: string;
  slug: string;
  email: string;
  role: 'SUPER_ADMIN' | 'STORE_OWNER';
  isActive: boolean;
  onboardingComplete: boolean;
  createdAt: string;
  logoUrl: string | null;
  primaryColor: string;
  whatsappPrimary: string | null;
  productsCount: number;
  analytics: {
    views: number;
    whatsappClicks: number;
  };
}

// =============================================================================
// API Function
// =============================================================================
async function fetchStores(): Promise<StoreWithMetrics[]> {
  const response = await fetch('/api/admin/stores');
  if (!response.ok) {
    throw new Error('Failed to fetch stores');
  }
  const data = await response.json();
  return data.stores;
}

// =============================================================================
// React Query Hook
// =============================================================================
export function useStores() {
  return useQuery({
    queryKey: ['admin', 'stores'],
    queryFn: fetchStores,
  });
}
