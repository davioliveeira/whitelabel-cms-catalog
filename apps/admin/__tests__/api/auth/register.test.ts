// =============================================================================
// API Tests - Registration Validation Logic
// =============================================================================
// Tests registration data validation rules

import * as zod from 'zod';

describe('Registration Validation Logic', () => {
  // Define the registration schema (matching what's used in the actual API)
  const registerSchema = zod.object({
    email: zod.string().email('Invalid email format'),
    password: zod.string().min(8, 'Password must be at least 8 characters'),
    name: zod.string().min(2, 'Name must be at least 2 characters'),
    slug: zod.string().min(3, 'Slug must be at least 3 characters'),
  });

  describe('Valid Input Cases', () => {
    it('should accept valid registration data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        name: 'John Doe',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });

    it('should accept long passwords', () => {
      const validData = {
        email: 'user@example.com',
        password: 'VeryLongAndSecurePassword123!@#$',
        name: 'Test User',
        slug: 'test-store',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePassword123!',
        name: 'John Doe',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject email without @ symbol', () => {
      const invalidData = {
        email: 'useremail.com',
        password: 'SecurePassword123!',
        name: 'John Doe',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should reject email without domain', () => {
      const invalidData = {
        email: 'user@',
        password: 'SecurePassword123!',
        name: 'John Doe',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('Password Validation', () => {
    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'short',
        name: 'John Doe',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 characters');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
        name: 'John Doe',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
    });

    it('should accept password exactly 8 characters', () => {
      const validData = {
        email: 'user@example.com',
        password: 'Pass1234',
        name: 'John Doe',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('Name Validation', () => {
    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        name: 'J',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2 characters');
      }
    });

    it('should accept name with 2 characters', () => {
      const validData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        name: 'JD',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('Slug Validation', () => {
    it('should reject slug shorter than 3 characters', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        name: 'John Doe',
        slug: 'ab',
      };

      const result = registerSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('3 characters');
      }
    });

    it('should accept slug with 3 characters', () => {
      const validData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        name: 'John Doe',
        slug: 'abc',
      };

      const result = registerSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('Required Fields', () => {
    it('should reject missing email', () => {
      const incompleteData = {
        password: 'SecurePassword123!',
        name: 'John Doe',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(incompleteData);

      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const incompleteData = {
        email: 'user@example.com',
        name: 'John Doe',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(incompleteData);

      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const incompleteData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        slug: 'john-store',
      };

      const result = registerSchema.safeParse(incompleteData);

      expect(result.success).toBe(false);
    });

    it('should reject missing slug', () => {
      const incompleteData = {
        email: 'user@example.com',
        password: 'SecurePassword123!',
        name: 'John Doe',
      };

      const result = registerSchema.safeParse(incompleteData);

      expect(result.success).toBe(false);
    });
  });
});
