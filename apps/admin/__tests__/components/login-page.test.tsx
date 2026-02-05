// =============================================================================
// Component Tests - Login Page
// =============================================================================
// Tests the login page UI and user interactions

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import LoginPage from '@/app/(auth)/login/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginPage Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Rendering', () => {
    it('should render login form elements', () => {
      render(<LoginPage />);

      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render link to registration page', () => {
      render(<LoginPage />);

      const registerLink = screen.getByRole('link', { name: /create an account/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty password', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'user@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call signIn with correct credentials on valid form submission', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({ ok: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'user@example.com',
          password: 'SecurePassword123!',
          redirect: false,
        });
      });
    });

    it('should redirect to dashboard on successful login', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({ ok: true });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show error message on failed login', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockResolvedValue({
        ok: false,
        error: 'Invalid credentials',
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'WrongPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/invalid email or password/i)
        ).toBeInTheDocument();
      });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      (signIn as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1000))
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'SecurePassword123!');
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should allow keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);

      // Tab to email input
      await user.tab();
      expect(emailInput).toHaveFocus();

      // Tab to password input
      await user.tab();
      expect(screen.getByLabelText(/password/i)).toHaveFocus();

      // Tab to submit button
      await user.tab();
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus();
    });
  });
});
