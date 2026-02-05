// =============================================================================
// User Management Hooks
// =============================================================================
// React Query hooks for user CRUD operations
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// =============================================================================
// Types
// =============================================================================
export interface User {
  id: string;
  email: string;
  name: string;
  slug: string;
  role: 'SUPER_ADMIN' | 'STORE_OWNER';
  isActive: boolean;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  slug: string;
  role?: 'SUPER_ADMIN' | 'STORE_OWNER';
}

export interface UpdateUserInput {
  name?: string;
  isActive?: boolean;
  role?: 'SUPER_ADMIN' | 'STORE_OWNER';
}

// =============================================================================
// API Functions
// =============================================================================

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  const data = await response.json();
  return data.users;
}

async function createUser(input: CreateUserInput): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }
  
  const data = await response.json();
  return data.user;
}

async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user');
  }
  
  const data = await response.json();
  return data.user;
}

async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }
}

// =============================================================================
// React Query Hooks
// =============================================================================

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
