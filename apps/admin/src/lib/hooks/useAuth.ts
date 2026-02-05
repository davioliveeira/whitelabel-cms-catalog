// =============================================================================
// useAuth Hook
// =============================================================================
// Simplified hook for accessing authentication state and user information.
// Wraps NextAuth's useSession for easier access throughout the application.
// =============================================================================

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    session,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    storeId: session?.user?.storeId,
    role: session?.user?.role,
  };
}
