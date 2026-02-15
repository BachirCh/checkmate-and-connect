import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Determine route type
  const isAdminRoute = path.startsWith('/admin');
  const isLoginRoute = path.startsWith('/admin/login');

  // Refresh session and get response with updated cookies
  const supabaseResponse = await updateSession(req);

  // Create Supabase client to check authentication
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check user authentication
  const { data: { user }, error } = await supabase.auth.getUser();

  // If accessing admin routes (not login) without authentication, redirect to login
  if (isAdminRoute && !isLoginRoute && (!user || error)) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // If accessing login page while authenticated, redirect to admin dashboard
  if (isLoginRoute && user && !error) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // Otherwise, return the response with refreshed session
  return supabaseResponse;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};
