# Admin authentication

## Where the boundary is

Authorisation is enforced **per page**, server-side, by `verifySession()` in
`lib/auth/dal.ts`. Every admin route calls it before rendering:

- `app/admin/page.tsx` → `verifySession()`
- `app/admin/members/page.tsx` → `verifySession()`
- `app/admin/login/page.tsx` → intentionally unguarded

`verifySession()` validates the JWT against the Supabase auth server with
`getUser()` (not `getSession()`, which only reads the local token without
verifying it) and checks for the `admin` role claim, redirecting to
`/admin/login` on failure.

**If you add a new admin page, it must call `verifySession()`.** There is no
middleware backstop.

## Why there is no middleware

There used to be a `proxy.ts` (Next 16's renamed middleware) that refreshed the
Supabase session and redirected unauthenticated `/admin` requests. It was
removed when the app moved to Cloudflare Workers.

The reason is a bundling failure, not a design preference. The OpenNext
Cloudflare adapter compiles middleware into a separate bundle and copies only a
partial `@opentelemetry/api` into it — `build/src` (CJS) but not `build/esm`,
which the package's `module` field points at. esbuild resolves `module` first
and the build dies with:

```
Could not resolve "@opentelemetry/api"
  .open-next/middleware/node_modules/next/dist/server/lib/trace/tracer.js
```

Installing `@opentelemetry/api` at the app level does not fix it, because the
adapter copies its own partial tree. `edgeExternals` in `open-next.config.ts`
does not apply either — that option only covers compiling the config file.

## What we lost

Silent session refresh. The Supabase access token expires after ~1 hour, and a
Server Component cannot write the refreshed cookie back. In practice an
organiser who leaves the admin panel open for more than an hour is sent to the
login screen instead of being refreshed transparently.

This is a convenience regression, not a security one — the session was never
the thing granting access; `verifySession()` is.

## If you want the refresh back

Either restore `proxy.ts` and get the adapter to bundle the middleware (upstream
fix, or a postinstall patch that copies `build/esm` into the adapter's tree), or
move the refresh into a Route Handler that the admin layout pings on an
interval — Route Handlers *can* set cookies.
