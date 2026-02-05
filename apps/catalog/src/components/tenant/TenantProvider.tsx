'use client';

// =============================================================================
// Tenant Provider Component
// =============================================================================
// Provides tenant data to child components via React Context.
// =============================================================================

import { createContext, useContext, type ReactNode } from 'react';
import type { TenantData, TenantContextValue } from '@/lib/tenant-context';

// =============================================================================
// Context
// =============================================================================

const TenantContext = createContext<TenantContextValue | null>(null);

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to access the current tenant.
 * @returns Tenant context value
 * @throws Error if used outside TenantProvider
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

/**
 * Hook to access tenant data with null safety.
 * @returns Tenant data or null
 */
export function useTenantData(): TenantData | null {
  const { tenant } = useTenant();
  return tenant;
}

// =============================================================================
// Provider
// =============================================================================

interface TenantProviderProps {
  /** Tenant data */
  tenant: TenantData | null;
  /** Child components */
  children: ReactNode;
}

/**
 * TenantProvider component.
 * Provides tenant context to all child components.
 * 
 * @example
 * ```tsx
 * <TenantProvider tenant={tenantData}>
 *   <App />
 * </TenantProvider>
 * ```
 */
export function TenantProvider({ tenant, children }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={{ tenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export default TenantProvider;
