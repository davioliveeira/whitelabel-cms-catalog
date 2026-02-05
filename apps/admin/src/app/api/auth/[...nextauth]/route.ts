// =============================================================================
// NextAuth.js API Route Handler
// =============================================================================
// This file creates the NextAuth.js API routes at /api/auth/*
// Handles sign in, sign out, session management, etc.
// =============================================================================

import { handlers } from '@/auth';

export const { GET, POST } = handlers;
