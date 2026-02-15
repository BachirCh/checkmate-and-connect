# Phase 4: Admin Authentication & Dashboard - Research

**Researched:** 2026-02-15
**Domain:** Supabase Auth with Next.js 16 App Router, Admin RBAC, Dashboard UI
**Confidence:** HIGH

## Summary

Phase 4 implements admin authentication and dashboard access using Supabase Auth's email/password authentication with custom claims for role-based access control. The existing Supabase setup (from Phase 1) already has RLS policies checking for admin roles via `auth.jwt()->>'role' = 'admin'`, so this phase focuses on: (1) creating admin user accounts in Supabase, (2) adding custom claims to identify admins, (3) implementing login/logout flows, (4) protecting admin routes with Next.js 16's proxy.ts, and (5) building a minimal mobile-responsive dashboard shell.

The technical foundation is already in place: @supabase/ssr v0.8.0 is configured with async cookies pattern, server/client utilities exist, and the middleware helper is ready. Next.js 16 renamed middleware.ts to proxy.ts and switched to Node.js runtime, which affects authentication patterns. The key architectural decision is using Supabase's Custom Access Token Hook to inject admin roles into JWTs, enabling both RLS policies and application-level authorization checks.

**Primary recommendation:** Use Supabase Auth's built-in email/password authentication with a Custom Access Token Hook to add admin role claims to JWTs. Protect routes using proxy.ts for optimistic checks (cookie-based) and verify authorization in a Data Access Layer (DAL) for secure checks. Build a minimal dashboard shell with mobile-responsive sidebar using Tailwind CSS utilities.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/ssr | 0.8.0 | SSR authentication with cookie handling | Official Supabase SSR package for Next.js, replaces deprecated auth-helpers. Handles PKCE flow and cookie management automatically. |
| @supabase/supabase-js | 2.95.3 | Supabase client library | Core client for interacting with Supabase Auth, Database, and Storage APIs. |
| Next.js | 16.1.6 | React framework with App Router | Built-in authentication patterns with proxy.ts (renamed from middleware.ts in v16). Server Components enable server-side auth checks. |
| Zod | 4.3.6 | Schema validation | Type-safe form validation for login forms. Already in dependencies from Phase 3. |
| React Hook Form | 7.71.1 | Form state management | Handles form state, validation, and submission with Server Actions. Already in dependencies from Phase 3. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jose | Latest | JWT signing/verification | If implementing custom session management. NOT needed with Supabase Auth (which handles JWTs). |
| iron-session | Latest | Encrypted cookie sessions | Alternative to JWT-based sessions. NOT needed with Supabase Auth. |
| React's cache | 19.0.0 | Memoize auth checks | Prevent duplicate database calls during render pass in Data Access Layer. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Auth | NextAuth.js v5 | NextAuth requires separate database tables, more configuration. Supabase Auth integrates with existing Supabase setup and RLS policies. |
| Custom Access Token Hook | Database session checks | Hook injects claims into JWT for zero-latency auth checks. Database checks add latency but offer real-time revocation. Hybrid approach recommended: JWT for speed, database for critical operations. |
| proxy.ts | Layout/component checks only | Proxy provides centralized routing protection and prevents unauthorized rendering. Component checks alone are insufficient (multiple entry points exist). |

**Installation:**
```bash
# Already installed in Phase 1
npm install @supabase/supabase-js @supabase/ssr
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (public)/              # Public routes (no auth required)
│   ├── join/              # Member submission (existing)
│   └── page.tsx           # Landing page (existing)
├── admin/                 # Protected admin routes
│   ├── layout.tsx         # Admin layout with sidebar
│   ├── page.tsx           # Admin dashboard home
│   └── login/             # Admin login flow
│       └── page.tsx       # Login form
├── actions/               # Server Actions
│   └── auth.ts            # Login/logout actions
lib/
├── supabase/              # Supabase clients (existing from Phase 1)
│   ├── client.ts          # Browser client
│   ├── server.ts          # Server client with cookies
│   └── middleware.ts      # Session refresh utility
├── auth/                  # Authentication utilities
│   ├── dal.ts             # Data Access Layer with verifySession
│   └── session.ts         # Session helpers
└── utils/
    └── admin.ts           # Admin-specific utilities
proxy.ts                   # Route protection (Next.js 16)
```

### Pattern 1: Supabase Email/Password Sign In with Server Actions

**What:** Use Supabase's built-in email/password authentication with Next.js Server Actions for login/logout flows.

**When to use:** All admin authentication flows. Server Actions provide secure server-side execution with automatic CSRF protection.

**Example:**
```typescript
// app/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
})

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Validate input
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  // Attempt sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      message: 'Invalid email or password',
    }
  }

  // Verify admin role (from JWT claims)
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role

  if (role !== 'admin') {
    await supabase.auth.signOut()
    return {
      message: 'Unauthorized: Admin access required',
    }
  }

  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
```

**Source:** [Supabase Password-Based Auth Docs](https://supabase.com/docs/guides/auth/passwords), [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)

### Pattern 2: Custom Access Token Hook for Admin Role

**What:** Use Supabase's Custom Access Token Hook to inject admin role into JWT claims before token issuance.

**When to use:** Required to identify admin users and enable RLS policies to check admin access.

**Example:**
```sql
-- 1. Create user_roles table to track admin status
CREATE TABLE IF NOT EXISTS public.user_roles (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read/write roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles
  FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- 2. Create function to add admin claim to JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims JSONB;
  user_role TEXT;
BEGIN
  -- Fetch user role from user_roles table
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = (event->>'user_id')::UUID;

  claims := event->'claims';

  -- Add role to claims if user has one
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  ELSE
    -- Default to 'user' role if no role assigned
    claims := jsonb_set(claims, '{role}', '"user"');
  END IF;

  -- Update event object
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- 3. Grant permissions to supabase_auth_admin
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.user_roles TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- 4. Manually insert admin users (run for each admin)
-- First create user in Supabase Auth dashboard, then:
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_FROM_AUTH_USERS_TABLE', 'admin');
```

**Configuration in Supabase Dashboard:**
1. Navigate to Authentication > Hooks (Beta)
2. Select "custom_access_token_hook" from dropdown
3. Tokens issued after hook configuration will include role claim

**Accessing role in application:**
```typescript
// Server-side
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
const role = user?.app_metadata?.role // undefined initially, but hooks inject into JWT

// Better: Decode JWT to access claims
const { data: { session } } = await supabase.auth.getSession()
// Decode session.access_token to get role claim
```

**Source:** [Supabase Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook), [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)

### Pattern 3: Route Protection with proxy.ts (Next.js 16)

**What:** Use Next.js 16's proxy.ts (renamed from middleware.ts) to perform optimistic authentication checks and redirect unauthorized users before rendering.

**When to use:** To prevent unauthorized users from accessing admin routes. Proxy runs on every request and provides fast cookie-based session checks.

**Important:** Next.js 16 changed middleware.ts → proxy.ts and switched to Node.js runtime (Edge not supported). Proxy should only perform optimistic checks using session cookies, NOT database calls.

**Example:**
```typescript
// proxy.ts (root of project)
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Define protected and public routes
  const isAdminRoute = path.startsWith('/admin')
  const isLoginRoute = path.startsWith('/admin/login')

  // Create Supabase client for session check
  let supabaseResponse = NextResponse.next({ request: req })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session (important for token refresh)
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect logic
  if (isAdminRoute && !isLoginRoute && !user) {
    // Unauthenticated user trying to access admin area
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  if (isLoginRoute && user) {
    // Already authenticated user trying to access login page
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return supabaseResponse
}

// Exclude static assets and API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Key considerations:**
- **proxy.ts runs on Node.js runtime** in Next.js 16 (not Edge)
- Use for **optimistic checks only** (fast cookie-based session validation)
- **DO NOT** call database or perform heavy authorization logic
- Always perform secure authorization checks in Data Access Layer
- The matcher excludes static assets to avoid unnecessary processing

**Source:** [Next.js 16 Authentication Guide](https://nextjs.org/docs/app/guides/authentication), [Next.js proxy.ts File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy), [Next.js 16 Release](https://nextjs.org/blog/next-16)

### Pattern 4: Data Access Layer (DAL) for Secure Authorization

**What:** Create a centralized Data Access Layer with `verifySession()` function that performs secure database-level authorization checks.

**When to use:** For all data access in Server Components, Server Actions, and Route Handlers. This is the **secure** check that complements proxy.ts's optimistic checks.

**Example:**
```typescript
// lib/auth/dal.ts
import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const verifySession = cache(async () => {
  const supabase = await createClient()

  // getUser() validates JWT signature and checks with auth server
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/admin/login')
  }

  // Verify admin role from JWT claims
  // Note: Role is injected by Custom Access Token Hook
  const { data: { session } } = await supabase.auth.getSession()

  // Decode JWT to get role claim (simplified - use jwt-decode in production)
  // For now, check user.app_metadata or session.user.user_metadata
  const role = user.app_metadata?.role || user.user_metadata?.role

  if (role !== 'admin') {
    redirect('/admin/login')
  }

  return {
    isAuth: true,
    userId: user.id,
    email: user.email,
    role,
  }
})

// Example usage in Server Component
export const getAdminData = cache(async () => {
  const session = await verifySession()

  // Now safe to fetch admin-specific data
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('status', 'pending')

  return data
})
```

**Usage in Server Components:**
```typescript
// app/admin/page.tsx
import { verifySession } from '@/lib/auth/dal'

export default async function AdminDashboard() {
  const session = await verifySession() // Redirects if not admin

  return (
    <div>
      <h1>Welcome, {session.email}</h1>
      {/* Admin dashboard content */}
    </div>
  )
}
```

**Usage in Server Actions:**
```typescript
// app/actions/members.ts
'use server'

import { verifySession } from '@/lib/auth/dal'
import { createClient } from '@/lib/supabase/server'

export async function approveMember(memberId: string) {
  await verifySession() // Ensures only admins can execute

  const supabase = await createClient()
  const { error } = await supabase
    .from('members')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', memberId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
```

**Why cache()?** React's `cache()` memoizes the function result during a single render pass, preventing duplicate authentication checks when `verifySession()` is called multiple times.

**Source:** [Next.js Authentication - Data Access Layer](https://nextjs.org/docs/app/guides/authentication)

### Pattern 5: Mobile-Responsive Dashboard Layout with Tailwind CSS

**What:** Build a responsive admin dashboard with collapsible sidebar navigation using Tailwind CSS utilities.

**When to use:** For the admin dashboard shell that houses all admin routes.

**Example:**
```typescript
// app/admin/layout.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 md:hidden"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 w-64 h-screen bg-gray-900 border-r border-gray-800
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 px-3">Admin Dashboard</h2>

          <nav className="space-y-2">
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/members"
              className="block px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              Members
            </Link>
            <form action={logout} className="pt-4">
              <button
                type="submit"
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800 transition-colors text-red-400"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="md:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
```

**Key Tailwind patterns:**
- `hidden md:flex` - Hide on mobile, show on medium+ screens
- `-translate-x-full` - Hide sidebar off-screen on mobile
- `translate-x-0` - Show sidebar when hamburger clicked
- `md:translate-x-0` - Always show on desktop
- `transition-transform duration-300` - Smooth slide animation
- `md:ml-64` - Push main content right on desktop (matches sidebar width)

**Source:** [Tailwind CSS Sidebar Components](https://tailwindcss.com/plus/ui-blocks/application-ui/application-shells/sidebar), [Flowbite Sidebar](https://flowbite.com/docs/components/sidebar/)

### Anti-Patterns to Avoid

- **Don't rely solely on middleware/proxy for security:** Proxy is for optimistic checks and routing. Always verify authorization in Data Access Layer close to data source. CVE-2025-29927 highlights this risk.

- **Don't check auth in Layouts:** Layouts don't re-render on navigation, so session checks won't run on route changes. Check auth in page components or Data Access Layer instead.

- **Don't use getSession() for authorization:** `getSession()` reads from local storage/cookies without revalidating with server. Use `getUser()` which validates JWT signature and checks auth server.

- **Don't return null in top-level component when unauthorized:** Next.js has multiple entry points (direct URL access, Server Actions, Route Handlers). Returning null doesn't prevent access to nested routes or actions.

- **Don't forget to refresh tokens in proxy:** Call `supabase.auth.getUser()` in proxy to refresh expired tokens, otherwise users get logged out prematurely.

- **Don't test RLS policies in SQL Editor:** SQL Editor runs as postgres role and bypasses RLS. Test policies using actual API calls from your application.

**Sources:** [Next.js Authentication Security](https://nextjs.org/docs/app/guides/authentication), [Supabase RLS Best Practices](https://designrevision.com/blog/supabase-row-level-security)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT signing/verification | Custom JWT library | Supabase Auth | Handles token signing, refresh, expiration, rotation. Edge cases like key rotation are complex. |
| Password hashing | Custom bcrypt implementation | Supabase Auth | Supabase uses bcrypt with proper salting, work factors, and handles timing attacks. |
| Session management | Custom cookie handling | @supabase/ssr | Handles PKCE flow, cookie expiration, HttpOnly flags, SameSite attributes, and Next.js 16 async cookies. |
| Role-based access control | Application-level role checks | Supabase Custom Claims + RLS | Database-level enforcement prevents bypassing app logic. Custom claims inject roles into JWT for zero-latency checks. |
| Login rate limiting | Custom attempt tracking | Supabase Auth built-in limits | Supabase enforces rate limits on auth endpoints automatically. |

**Key insight:** Authentication involves cryptography, timing attacks, secure random generation, and database-level security. Supabase Auth is battle-tested and handles these complexities. Custom implementations inevitably miss edge cases that lead to vulnerabilities.

## Common Pitfalls

### Pitfall 1: Using middleware.ts in Next.js 16

**What goes wrong:** Next.js 16 renamed middleware.ts to proxy.ts and switched to Node.js runtime. Using middleware.ts causes routing to fail silently or throw runtime errors.

**Why it happens:** Breaking change in Next.js 16. Documentation and tutorials for Next.js 15 and earlier reference middleware.ts.

**How to avoid:**
- Use `proxy.ts` at project root (not middleware.ts)
- Export `proxy` function (not default export)
- Know that proxy runs on Node.js runtime (Edge not supported)
- Update matcher config if needed

**Warning signs:** Routes not protected, middleware not executing, runtime errors about Edge compatibility.

**Sources:** [Next.js 16 Release](https://nextjs.org/blog/next-16), [Next.js proxy.ts Docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)

### Pitfall 2: Confusing getSession() vs getUser()

**What goes wrong:** Using `getSession()` for authorization checks. This reads from local storage/cookies without revalidating with auth server, so logged-out users can still access protected routes until cookie expires.

**Why it happens:** `getSession()` is faster (no network call) and seems equivalent to `getUser()`.

**How to avoid:**
- Use `getUser()` for authorization checks (validates with auth server)
- Use `getSession()` only for reading session data after auth is verified
- In proxy.ts, call `getUser()` to ensure tokens are refreshed

**Warning signs:** Users can access admin routes after logging out from another device. Token revocation doesn't work immediately.

**Sources:** [Supabase JWT Security Discussion](https://github.com/orgs/supabase/discussions/20763), [Supabase Server-Side Auth Advanced Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)

### Pitfall 3: Custom claims not available immediately

**What goes wrong:** Admin logs in but JWT doesn't contain role claim. Application denies access even though user is admin in database.

**Why it happens:** Custom Access Token Hook only injects claims when **new tokens are issued**. If user was already logged in before hook was configured, their existing token won't have the claim.

**How to avoid:**
- After configuring Custom Access Token Hook, have admins log out and log back in
- Document in setup instructions that admins must re-login after hook setup
- Consider adding admin check in DAL that falls back to database query if claim is missing

**Warning signs:** RLS policies work (admin can access data) but application-level checks fail. JWT decoder shows no role claim.

**Sources:** [Supabase Custom Claims Discussion](https://github.com/orgs/supabase/discussions/22337)

### Pitfall 4: Missing indexes on RLS policy columns

**What goes wrong:** Admin dashboard loads slowly. Database queries time out as member count grows.

**Why it happens:** RLS policies filter every query. Without indexes on policy columns (like status, user_id), Postgres does full table scans.

**How to avoid:**
- Add indexes to all columns used in RLS policy WHERE clauses
- Existing migration already indexes `status` column (`CREATE INDEX idx_members_status ON members(status)`)
- Monitor query performance in Supabase dashboard

**Warning signs:** Slow page loads, database CPU spikes, query timeouts in logs.

**Sources:** [Supabase RLS Performance Guide](https://designrevision.com/blog/supabase-row-level-security)

### Pitfall 5: Testing RLS policies in SQL Editor

**What goes wrong:** RLS policies appear to work in SQL Editor but fail in application. Data leaks occur because policies weren't actually tested.

**Why it happens:** SQL Editor runs as `postgres` superuser role which bypasses ALL RLS policies. This gives false confidence.

**How to avoid:**
- Test RLS policies using actual API calls from application (not SQL Editor)
- Use Supabase client in browser console or Postman for testing
- Create test users with different roles and verify access
- Check Supabase logs to see which policies are being evaluated

**Warning signs:** Policies look correct in SQL but users can access unauthorized data.

**Sources:** [Supabase RLS Complete Guide](https://designrevision.com/blog/supabase-row-level-security)

### Pitfall 6: Caching issues with SSR and cookies

**What goes wrong:** User logs in but sees previous user's data. Session changes don't reflect immediately.

**Why it happens:** Next.js caching doesn't account for user-specific cookies. Cached pages serve wrong data to wrong users.

**How to avoid:**
- Mark pages as dynamic: `export const dynamic = 'force-dynamic'`
- Use `cookies()` to opt out of static optimization
- Include refresh token in cache key if using custom caching
- Existing server client already uses `cookies()` which makes routes dynamic

**Warning signs:** Different users see same data, logout doesn't update UI, stale session information.

**Sources:** [Supabase SSR Advanced Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide)

## Code Examples

Verified patterns from official sources:

### Login Form with Server Action
```typescript
// app/admin/login/page.tsx
'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg border border-gray-800">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-sm text-red-400">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-sm text-red-400">{state.errors.password[0]}</p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-red-400">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-md font-medium transition-colors"
          >
            {pending ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Source:** [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)

### Creating Admin Users in Supabase

```sql
-- Step 1: Create admin user in Supabase Dashboard
-- Go to Authentication > Users > Add user
-- Email: admin@example.com
-- Password: (auto-generated or custom)
-- Copy the user UUID after creation

-- Step 2: Assign admin role in SQL Editor
INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE_USER_UUID_HERE', 'admin');

-- Step 3: Verify admin role
SELECT
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';
```

**Source:** [Supabase Custom Claims RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)

### Logout Server Action with Redirect

```typescript
// app/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
```

**Source:** [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 16 (2025) | File renamed, runs on Node.js runtime (not Edge). Must update all auth middleware to use proxy.ts. |
| @supabase/auth-helpers | @supabase/ssr | 2024 | Auth helpers deprecated. SSR package is framework-agnostic and handles PKCE flow automatically. |
| Manual JWT verification | Custom Access Token Hooks | 2024 | Hooks inject custom claims before token issuance. Eliminates need for manual JWT parsing in most cases. |
| Static admin checks | RLS with custom claims | 2024 | Database-level enforcement prevents bypassing app logic. Policies read JWT claims directly. |
| Edge runtime middleware | Node.js proxy | Next.js 16 (2025) | Proxy only supports Node.js runtime. Improves compatibility with Node.js-only libraries. |

**Deprecated/outdated:**
- **middleware.ts:** Renamed to proxy.ts in Next.js 16. Old name no longer works.
- **@supabase/auth-helpers:** Deprecated in favor of @supabase/ssr. No longer maintained.
- **getSession() for auth:** Doesn't revalidate with server. Use getUser() instead.
- **cookies() without await:** Next.js 16 made cookies() async. Must use `await cookies()`.

**Sources:** [Next.js 16 Release](https://nextjs.org/blog/next-16), [Supabase SSR Migration Guide](https://supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package-5NRunM)

## Open Questions

1. **Admin user provisioning workflow**
   - What we know: Admin users must be created in Supabase Auth dashboard, then assigned admin role in user_roles table via SQL.
   - What's unclear: Should we build a "first admin" setup wizard, or document manual SQL setup?
   - Recommendation: Document manual SQL setup for 2-3 admins (requirement). Building admin provisioning UI is out of scope for Phase 4.

2. **JWT claim refresh timing**
   - What we know: Custom Access Token Hook only affects new tokens. Existing tokens retain old claims until refresh.
   - What's unclear: How often do tokens refresh automatically? Do admins need to log out/in after role assignment?
   - Recommendation: Document that admins must log out and log back in after role assignment. This is a one-time setup cost.

3. **Admin role storage location**
   - What we know: Custom hooks inject into JWT claims. Could also store in user_metadata or app_metadata.
   - What's unclear: What's the authoritative source for role? JWT claim, app_metadata, or database?
   - Recommendation: Use database (user_roles table) as source of truth. Hook injects into JWT for performance. DAL can fall back to database if JWT claim is missing.

4. **Mobile dashboard testing**
   - What we know: Tailwind provides responsive utilities. Layout should work on mobile.
   - What's unclear: Have we tested on actual devices per ADMIN-08 requirement?
   - Recommendation: Phase 4 builds mobile-responsive layout. Phase 6 (Launch Preparation) includes physical device testing per LAUNCH-01.

## Sources

### Primary (HIGH confidence)
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - Official integration guide
- [Next.js 16 Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - Official Next.js auth patterns
- [Supabase Custom Access Token Hooks](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook) - JWT claim injection
- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) - Role-based access
- [Supabase Password-Based Auth](https://supabase.com/docs/guides/auth/passwords) - Sign in/sign up flows
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16) - middleware.ts → proxy.ts change
- [Next.js proxy.ts File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) - Official proxy.ts docs

### Secondary (MEDIUM confidence)
- [Tailwind CSS Sidebar Components](https://tailwindcss.com/plus/ui-blocks/application-ui/application-shells/sidebar) - Responsive sidebar patterns
- [Flowbite Sidebar Documentation](https://flowbite.com/docs/components/sidebar/) - Component examples
- [Supabase RLS Complete Guide (2026)](https://designrevision.com/blog/supabase-row-level-security) - Performance and security best practices
- [Next.js Security Best Practices](https://medium.com/@sureshdotariya/robust-security-authentication-best-practices-in-next-js-16-6265d2d41b13) - Security patterns
- [Auth0 Next.js 16 Authentication Guide](https://auth0.com/blog/whats-new-nextjs-16/) - Industry patterns

### Tertiary (LOW confidence)
- Medium articles on Supabase + Next.js auth - Useful for common pitfalls but not official
- GitHub discussions on auth issues - Real-world problems but not authoritative solutions
- Admin dashboard templates - UI inspiration but may use outdated patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via package.json and official docs
- Architecture: HIGH - Patterns sourced from official Next.js and Supabase documentation
- Pitfalls: MEDIUM - Combination of official docs and community discussions

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days - stable authentication patterns)

**Key technologies researched:**
- Next.js 16.1.6 (stable)
- @supabase/ssr 0.8.0 (stable)
- @supabase/supabase-js 2.95.3 (stable)
- Supabase Custom Access Token Hooks (Beta)
- React 19.0.0 Server Components (stable)
