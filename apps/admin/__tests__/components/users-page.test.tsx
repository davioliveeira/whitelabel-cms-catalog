// =============================================================================
// Component Tests - Users Management Page
// =============================================================================
// Tests the user management page UI and interactions

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UsersPage from '@/app/(authenticated)/users/page';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/useUsers';

// Mock dependencies
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useUsers', () => ({
  useUsers: jest.fn(),
  useCreateUser: jest.fn(),
  useUpdateUser: jest.fn(),
  useDeleteUser: jest.fn(),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('UsersPage Component', () => {
  const mockUsers = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      name: 'User One',
      slug: 'user-one-store',
      role: 'STORE_OWNER',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      _count: { products: 10 },
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      name: 'User Two',
      slug: 'user-two-store',
      role: 'STORE_OWNER',
      isActive: true,
      createdAt: new Date('2024-01-02'),
      _count: { products: 5 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Access Control', () => {
    it('should show access denied for non-SUPER_ADMIN users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        role: 'STORE_OWNER',
        isAuthenticated: true,
      });

      renderWithQueryClient(<UsersPage />);

      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });

    it('should render page for SUPER_ADMIN users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        role: 'SUPER_ADMIN',
        isAuthenticated: true,
      });

      (useUsers as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      });

      (useCreateUser as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });

      (useDeleteUser as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });

      renderWithQueryClient(<UsersPage />);

      expect(screen.getByRole('heading', { name: /user management/i })).toBeInTheDocument();
    });
  });

  describe('User List Display', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        role: 'SUPER_ADMIN',
        isAuthenticated: true,
      });

      (useCreateUser as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });

      (useDeleteUser as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });
    });

    it('should display list of users', () => {
      (useUsers as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      });

      renderWithQueryClient(<UsersPage />);

      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    it('should display product counts', () => {
      (useUsers as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      });

      renderWithQueryClient(<UsersPage />);

      expect(screen.getByText('10 products')).toBeInTheDocument();
      expect(screen.getByText('5 products')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      (useUsers as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      renderWithQueryClient(<UsersPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show empty state when no users', () => {
      (useUsers as jest.Mock).mockReturnValue({
        data: { users: [] },
        isLoading: false,
      });

      renderWithQueryClient(<UsersPage />);

      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  describe('Create User Dialog', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        role: 'SUPER_ADMIN',
        isAuthenticated: true,
      });

      (useUsers as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      });

      (useDeleteUser as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });
    });

    it('should open create user dialog on button click', async () => {
      const user = userEvent.setup();

      (useCreateUser as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });

      renderWithQueryClient(<UsersPage />);

      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('should submit create user form with valid data', async () => {
      const user = userEvent.setup();
      const mockMutate = jest.fn();

      (useCreateUser as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      renderWithQueryClient(<UsersPage />);

      // Open dialog
      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      // Fill form
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/password/i), 'SecurePassword123!');
      await user.type(screen.getByLabelText(/name/i), 'New User');
      await user.type(screen.getByLabelText(/slug/i), 'new-user-store');

      // Submit
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
          name: 'New User',
          slug: 'new-user-store',
          role: 'STORE_OWNER',
        });
      });
    });

    it('should show validation errors for invalid form data', async () => {
      const user = userEvent.setup();

      (useCreateUser as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });

      renderWithQueryClient(<UsersPage />);

      // Open dialog
      const createButton = screen.getByRole('button', { name: /create user/i });
      await user.click(createButton);

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Delete User', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        role: 'SUPER_ADMIN',
        isAuthenticated: true,
      });

      (useUsers as jest.Mock).mockReturnValue({
        data: { users: mockUsers },
        isLoading: false,
      });

      (useCreateUser as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });
    });

    it('should open delete confirmation dialog', async () => {
      const user = userEvent.setup();

      (useDeleteUser as jest.Mock).mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
      });

      renderWithQueryClient(<UsersPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    });

    it('should call delete mutation on confirmation', async () => {
      const user = userEvent.setup();
      const mockMutate = jest.fn();

      (useDeleteUser as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      renderWithQueryClient(<UsersPage />);

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith('user-1');
      });
    });

    it('should cancel deletion on cancel button click', async () => {
      const user = userEvent.setup();
      const mockMutate = jest.fn();

      (useDeleteUser as jest.Mock).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      renderWithQueryClient(<UsersPage />);

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });
});
