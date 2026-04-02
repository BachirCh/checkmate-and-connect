'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Login server action
export async function login(prevState: any, formData: FormData) {
  // Extract and validate form data
  const rawFormData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validation = loginSchema.safeParse(rawFormData);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validation.data;

  try {
    const supabase = await createClient();

    // Authenticate user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        message: 'Invalid email or password',
      };
    }

    // Verify admin role
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return {
        message: 'Invalid email or password',
      };
    }

    // Get the session to access JWT token
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session?.access_token) {
      await supabase.auth.signOut();
      return {
        message: 'Unauthorized: Admin access required',
      };
    }

    // Decode JWT to get custom claims
    // JWT format: header.payload.signature
    const token = sessionData.session.access_token;
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());

    // The custom_access_token_hook adds role to claims
    const role = payload.role;

    if (role !== 'admin') {
      // Sign out non-admin users
      await supabase.auth.signOut();
      return {
        message: 'Unauthorized: Admin access required',
      };
    }

    // Success - redirect to admin dashboard
  } catch (error) {
    return {
      message: 'An unexpected error occurred',
    };
  }

  // Redirect outside try/catch (Next.js redirect throws internally)
  redirect('/admin');
}

// Logout server action
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
