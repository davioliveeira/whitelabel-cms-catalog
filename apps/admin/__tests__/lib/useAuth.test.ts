// =============================================================================
// Unit Tests - useAuth Hook
// =============================================================================
// Tests the custom authentication hook

import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/lib/hooks/useAuth';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authenticated State', () => {
    it('should return user data when authenticated', () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Test User',
          role: 'STORE_OWNER',
          tenantId: 'tenant-123',
        },
      };

      (useSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockSession.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.tenantId).toBe('tenant-123');
      expect(result.current.role).toBe('STORE_OWNER');
      expect(result.current.isLoading).toBe(false);
    });

    it('should identify SUPER_ADMIN role', () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          tenantId: 'admin-tenant',
        },
      };

      (useSession as jest.Mock).mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.role).toBe('SUPER_ADMIN');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Unauthenticated State', () => {
    it('should return null user when not authenticated', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeUndefined();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.tenantId).toBeUndefined();
      expect(result.current.role).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Loading State', () => {
    it('should return loading state when session is loading', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
