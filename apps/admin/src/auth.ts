// =============================================================================
// NextAuth.js v5 Configuration
// =============================================================================
// Authentication configuration for the CMS Catálogo White Label admin app.
// Uses credentials provider (email/password) with JWT session strategy.
// =============================================================================

import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '@cms/shared';

const prisma = new PrismaClient();

// =============================================================================
// TypeScript Module Augmentation
// =============================================================================
// Extend NextAuth types to include our custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'SUPER_ADMIN' | 'STORE_OWNER' | 'ATTENDANT';
      storeId: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: 'SUPER_ADMIN' | 'STORE_OWNER' | 'ATTENDANT';
    storeId: string | null;
  }
}

// =============================================================================
// NextAuth Configuration
// =============================================================================
export const { handlers, auth, signIn, signOut } = NextAuth({
  // ---------------------------------------------------------------------------
  // Providers
  // ---------------------------------------------------------------------------
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const fs = require('fs');
        const path = require('path');
        const logFile = path.join(process.cwd(), 'debug-auth.log');
        const log = (msg: string) => {
          const timestamp = new Date().toISOString();
          fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
        };

        log(`Authorize called with email: ${credentials?.email}`);

        if (!credentials?.email || !credentials?.password) {
          log('Missing credentials');
          throw new Error('Email and password are required');
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email },
            include: { store: true },
          });

          if (!user) {
            log(`User not found for email: ${email}`);
            throw new Error('Invalid email or password');
          }

          log(`User found: ${user.id}, Role: ${user.role}, IsActive: ${user.isActive}`);

          // Check if account is active
          if (!user.isActive) {
            log('User account is inactive');
            throw new Error('Account is inactive. Please contact support.');
          }

          // Verify password
          // Re-import because of ESM issues potentially, or just use verifyPassword
          log(`Verifying password... Hash: ${user.passwordHash?.substring(0, 10)}...`);
          const isValidPassword = await verifyPassword(
            password,
            user.passwordHash
          );

          log(`Password valid: ${isValidPassword}`);

          if (!isValidPassword) {
            log('Password validation failed');
            throw new Error('Invalid email or password');
          }

          // Return user object
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.store?.name || 'User',
            role: user.role,
            storeId: user.storeId,
          };
        } catch (error: any) {
          log(`Error in authorize: ${error.message}`);
          throw error;
        }
      },
    }),
  ],

  // ---------------------------------------------------------------------------
  // Session Strategy
  // ---------------------------------------------------------------------------
  // Using JWT to avoid database writes on every request
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ---------------------------------------------------------------------------
  // Custom Pages
  // ---------------------------------------------------------------------------
  pages: {
    signIn: '/login',
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
  },

  // ---------------------------------------------------------------------------
  // Callbacks
  // ---------------------------------------------------------------------------
  callbacks: {
    // Redirect callback - where to send user after sign in
    redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },

    // JWT callback - runs when JWT is created or updated
    async jwt({ token, user }) {
      // Initial sign in - user object is available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.storeId = user.storeId;

        // Store role for redirect decision
        token.redirectRole = user.role;
      }

      return token;
    },

    // Session callback - runs when session is checked
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as 'SUPER_ADMIN' | 'STORE_OWNER' | 'ATTENDANT';
        session.user.storeId = (token.storeId as string) || null;
      }

      return session;
    },
  },

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
    async signOut() {
      console.log('User signed out');
    },
  },

  // ---------------------------------------------------------------------------
  // Debug (only in development)
  // ---------------------------------------------------------------------------
  debug: process.env.NODE_ENV === 'development',
});
