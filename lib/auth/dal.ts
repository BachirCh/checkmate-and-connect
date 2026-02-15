import 'server-only';

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Type for authenticated admin session
export type AdminSession = {
  isAuth: true;
  userId: string;
  email: string;
  role: string;
};

/**
 * Data Access Layer for admin authentication.
 *
 * Verifies the user session and ensures the user has admin role.
 * Uses React cache() to memoize the result within a single request.
 *
 * IMPORTANT: Uses getUser() instead of getSession() for proper JWT validation
 * against Supabase auth server. getSession() only reads the local JWT without
 * verification, which is not secure for authorization.
 *
 * @returns AdminSession object with user details
 * @throws Redirects to /admin/login if not authenticated or not admin
 */
export const verifySession = cache(async (): Promise<AdminSession> => {
  const supabase = await createClient();

  // Validate session with Supabase auth server (NOT just local JWT)
  const { data: { user }, error } = await supabase.auth.getUser();

  // If no valid session, redirect to login
  if (error || !user) {
    redirect('/admin/login');
  }

  // Get role from app_metadata (populated by custom_access_token_hook)
  const role = user.app_metadata?.role;

  // If not admin, redirect to login
  if (role !== 'admin') {
    redirect('/admin/login');
  }

  // Return authenticated admin session
  return {
    isAuth: true,
    userId: user.id,
    email: user.email!,
    role,
  };
});
