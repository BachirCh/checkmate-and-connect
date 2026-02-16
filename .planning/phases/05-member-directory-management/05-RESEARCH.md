# Phase 5: Member Directory & Management - Research

**Researched:** 2026-02-16
**Domain:** Public member directory with admin management UI, Sanity CMS mutations, responsive data tables
**Confidence:** HIGH

## Summary

Phase 5 implements a dual-interface system: a public member directory for visitors to browse approved profiles, and an admin management interface for reviewing pending submissions and managing the member database. The existing infrastructure provides the foundation: Sanity v3 stores member documents with status-based privacy (pending/approved/rejected), the admin authentication system from Phase 4 secures the management interface, and member submissions from Phase 3 populate the pending queue.

The technical challenges center on three domains: (1) building a mobile-responsive public directory that displays approved members with photos and professional information using Sanity's image CDN with hotspot support, (2) creating admin data tables with filtering and sorting to manage hundreds of pending submissions efficiently, and (3) implementing Sanity write operations through Server Actions for approval/rejection workflows with proper revalidation to update the public directory immediately.

The architecture leverages React 19 Server Components for data fetching, Server Actions for mutations, and Next.js 16's revalidation system to keep the directory synchronized with Sanity. The member schema already includes all required fields (name, photo, jobTitle, company, linkedIn, status, approvedAt, submittedAt), and the existing GROQ query pattern filters by `status == "approved"` for privacy compliance. The grayscale-to-color hover effect from MemberHighlights component establishes the visual pattern to extend.

**Primary recommendation:** Build the public directory as a Server Component with GROQ queries filtering by approved status, use the existing grid layout pattern from MemberHighlights with Sanity's urlFor() for optimized images, create admin tables as Server Components fetching pending members with simple filter/sort controls, and implement approval/rejection through Server Actions using Sanity's patch API with revalidatePath to update both admin and public views.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-sanity | 12.1.0 | Next.js integration for Sanity | Official Sanity package for Next.js with React 19 Server Components support. Provides useQuery, useLiveQuery, and CDN utilities. |
| @sanity/client | 7.14.1 | Sanity client for reads | Official Sanity client with GROQ query support. Already configured with CDN enabled for public queries. |
| @sanity/image-url | 2.0.3 | Image URL builder | Official image CDN utility with hotspot/crop support. Generates optimized URLs from Sanity image references. |
| React Hook Form | 7.71.1 | Form state management | Handles form state for admin edit forms. Already used in MemberSubmissionForm. |
| Zod | 4.3.6 | Schema validation | Type-safe validation for Server Actions. Already used for member submission validation. |
| Tailwind CSS | 4.0.0 | Responsive layouts | Black/white theme with responsive grid utilities. Already configured for mobile-first design. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| server-only | 0.0.1 | Enforce server-only code | Import in files using write-client to prevent client bundle inclusion. |
| next/cache | 16.1.6 | Revalidation APIs | revalidatePath after mutations to update cached pages. |
| React's cache | 19.0.0 | Request memoization | Deduplicate Sanity queries within single request. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Components for directory | Client-side SWR/React Query | Server Components eliminate loading states and reduce bundle size. Client fetching better for real-time updates, but directory content is semi-static. |
| GROQ filtering | Client-side filtering | GROQ filtering at CDN edge is faster and reduces data transfer. Client filtering works for small datasets but scales poorly. |
| revalidatePath | revalidateTag | revalidatePath simpler for page-level invalidation. revalidateTag better for fine-grained cache control across multiple pages. |
| Simple table markup | TanStack Table | Simple markup sufficient for basic sorting/filtering. TanStack Table adds complexity but provides advanced features (column resizing, multi-sort, virtual scrolling). |

**Installation:**
```bash
# Already installed in Phases 1-3
npm install @sanity/client @sanity/image-url next-sanity
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (public)/
│   ├── members/           # Public member directory
│   │   └── page.tsx       # Directory listing (Server Component)
│   └── layout.tsx         # Public layout (existing)
├── admin/
│   ├── members/           # Admin member management
│   │   ├── page.tsx       # Pending members table
│   │   ├── [id]/          # Individual member management
│   │   │   └── page.tsx   # Edit/approve/reject
│   │   └── components/    # Admin-specific components
│   │       ├── MemberTable.tsx
│   │       ├── MemberRow.tsx
│   │       └── StatusBadge.tsx
│   ├── layout.tsx         # Admin layout with sidebar (existing)
│   └── page.tsx           # Dashboard with stats
├── actions/
│   └── members.ts         # Member management Server Actions
components/
├── MemberCard.tsx         # Public directory member card
├── MemberGrid.tsx         # Responsive grid layout
└── MemberHighlights.tsx   # Home page highlights (existing)
lib/
├── sanity/
│   ├── queries.ts         # GROQ queries (existing)
│   ├── write-client.ts    # Write client (existing)
│   └── mutations.ts       # Member mutation functions (NEW)
└── validations/
    └── member-edit.ts     # Admin edit validation schema (NEW)
```

### Pattern 1: Public Directory with Server Component GROQ Queries

**What:** Fetch approved members using GROQ queries in Server Components with automatic CDN caching.

**When to use:** For the public `/members` directory page where visitors browse approved profiles.

**Example:**
```typescript
// app/(public)/members/page.tsx
import { client } from '@/lib/sanity/client'
import { urlFor } from '@/lib/sanity/imageUrl'
import MemberGrid from '@/components/MemberGrid'

// GROQ query for approved members
const approvedMembersQuery = `*[_type == "member" && status == "approved"] | order(approvedAt desc) {
  _id,
  name,
  slug,
  photo,
  jobTitle,
  company,
  linkedIn,
  approvedAt
}`

export default async function MembersPage() {
  // Fetch approved members (Server Component - runs on server)
  const members = await client.fetch(approvedMembersQuery)

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Member Directory
          </h1>
          <p className="text-lg text-gray-400">
            {members.length} approved members
          </p>
        </div>

        <MemberGrid members={members} />
      </div>
    </main>
  )
}
```

**Source:** [Next.js Data Fetching](https://nextjs.org/docs/app/getting-started/fetching-data), Existing `lib/sanity/queries.ts`

### Pattern 2: Responsive Member Grid with Sanity Image CDN

**What:** Display member cards in responsive grid using Tailwind CSS with Sanity's image CDN for optimized photos with hotspot support.

**When to use:** For both public directory and admin member lists. Extends existing MemberHighlights pattern.

**Example:**
```typescript
// components/MemberCard.tsx
import Link from 'next/link'
import { urlFor } from '@/lib/sanity/imageUrl'

type Member = {
  _id: string
  name: string
  slug: { current: string }
  photo: any
  jobTitle: string
  company?: string
  linkedIn?: string
}

export default function MemberCard({ member }: { member: Member }) {
  // Generate optimized image URL with hotspot support
  const imageUrl = urlFor(member.photo)
    .width(400)
    .height(400)
    .fit('crop')
    .auto('format')
    .url()

  return (
    <div className="group relative overflow-hidden rounded-xl aspect-square bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all">
      <img
        src={imageUrl}
        alt={member.name}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
      />

      {/* Hover overlay with info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-semibold text-sm mb-1">
            {member.name}
          </p>
          <p className="text-gray-300 text-xs mb-1">
            {member.jobTitle}
          </p>
          {member.company && (
            <p className="text-gray-400 text-xs">
              {member.company}
            </p>
          )}
          {member.linkedIn && (
            <a
              href={member.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-xs hover:underline mt-2 inline-block"
            >
              LinkedIn →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// components/MemberGrid.tsx
import MemberCard from './MemberCard'

export default function MemberGrid({ members }: { members: Member[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {members.map((member) => (
        <MemberCard key={member._id} member={member} />
      ))}
    </div>
  )
}
```

**Key patterns:**
- `urlFor(photo).width(400).height(400).fit('crop')` - Generates optimized CDN URL
- `.auto('format')` - Automatically serves WebP/AVIF to supporting browsers
- Hotspot support is automatic when photo field has `options: { hotspot: true }`
- `grayscale group-hover:grayscale-0` - Existing hover effect pattern from MemberHighlights
- `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` - Mobile-first responsive grid

**Source:** [@sanity/image-url docs](https://www.sanity.io/docs/image-url), Existing `components/MemberHighlights.tsx`

### Pattern 3: Admin Member Table with Server Component

**What:** Build admin member management table as Server Component with status filtering and basic sorting.

**When to use:** For admin interface to view pending submissions, approved members, and rejected submissions.

**Example:**
```typescript
// app/admin/members/page.tsx
import { verifySession } from '@/lib/auth/dal'
import { client } from '@/lib/sanity/client'
import MemberTable from './components/MemberTable'

type SearchParams = {
  status?: 'pending' | 'approved' | 'rejected'
  sort?: 'newest' | 'oldest' | 'name'
}

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Verify admin session
  await verifySession()

  // Get filter params (default to pending)
  const status = searchParams.status || 'pending'
  const sort = searchParams.sort || 'newest'

  // Build GROQ query with filters
  const sortOrder = sort === 'name'
    ? 'order(name asc)'
    : sort === 'oldest'
    ? 'order(submittedAt asc)'
    : 'order(submittedAt desc)'

  const query = `*[_type == "member" && status == $status] | ${sortOrder} {
    _id,
    name,
    slug,
    photo,
    jobTitle,
    company,
    linkedIn,
    status,
    submittedAt,
    approvedAt
  }`

  const members = await client.fetch(query, { status })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Member Management</h1>
        <div className="text-gray-400">
          {members.length} {status} members
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <FilterTab status="pending" current={status} />
        <FilterTab status="approved" current={status} />
        <FilterTab status="rejected" current={status} />
      </div>

      {/* Sort controls */}
      <div className="flex gap-2">
        <SortButton sort="newest" current={sort} />
        <SortButton sort="oldest" current={sort} />
        <SortButton sort="name" current={sort} />
      </div>

      <MemberTable members={members} />
    </div>
  )
}

// Filter tab component (Client Component for interactivity)
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

function FilterTab({ status, current }: { status: string; current: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = () => {
    const params = new URLSearchParams(searchParams)
    params.set('status', status)
    router.push(`?${params.toString()}`)
  }

  const isActive = status === current

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 font-medium transition-colors ${
        isActive
          ? 'border-b-2 border-white text-white'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  )
}
```

**Key patterns:**
- Server Component for data fetching with `verifySession()` auth check
- URL search params for filter/sort state (shareable URLs, back button works)
- GROQ queries with parameters: `client.fetch(query, { status })`
- Client Components only for interactive filter/sort controls
- Minimal table UI - no complex data grid library needed for ~100s of rows

**Source:** [Next.js App Router Data Fetching](https://nextjs.org/docs/app/getting-started/fetching-data), [Next.js searchParams](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)

### Pattern 4: Member Approval/Rejection with Server Actions

**What:** Use Server Actions with Sanity patch API to approve or reject member submissions, then revalidate to update UI.

**When to use:** For all admin member management operations (approve, reject, edit, delete).

**Example:**
```typescript
// app/actions/members.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth/dal'
import { writeClient } from '@/lib/sanity/write-client'

export async function approveMember(memberId: string) {
  // Verify admin authorization
  await verifySession()

  try {
    // Patch member document to approved status
    await writeClient
      .patch(memberId)
      .set({
        status: 'approved',
        approvedAt: new Date().toISOString(),
      })
      .commit()

    // Revalidate both admin page and public directory
    revalidatePath('/admin/members')
    revalidatePath('/members')

    return { success: true }
  } catch (error) {
    console.error('Approve member error:', error)
    return { success: false, error: 'Failed to approve member' }
  }
}

export async function rejectMember(memberId: string, reason?: string) {
  await verifySession()

  try {
    await writeClient
      .patch(memberId)
      .set({
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'Did not meet approval criteria',
      })
      .commit()

    revalidatePath('/admin/members')

    return { success: true }
  } catch (error) {
    console.error('Reject member error:', error)
    return { success: false, error: 'Failed to reject member' }
  }
}

export async function deleteMember(memberId: string) {
  await verifySession()

  try {
    await writeClient.delete(memberId)

    revalidatePath('/admin/members')
    revalidatePath('/members')

    return { success: true }
  } catch (error) {
    console.error('Delete member error:', error)
    return { success: false, error: 'Failed to delete member' }
  }
}

export async function editMember(memberId: string, updates: {
  name?: string
  jobTitle?: string
  company?: string
  linkedIn?: string
}) {
  await verifySession()

  try {
    // Validate updates with Zod schema
    const validatedData = memberEditSchema.parse(updates)

    await writeClient
      .patch(memberId)
      .set(validatedData)
      .commit()

    revalidatePath('/admin/members')
    revalidatePath('/members')

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors }
    }
    return { success: false, error: 'Failed to update member' }
  }
}
```

**Key patterns:**
- `verifySession()` at start of every action for authorization
- `writeClient.patch(id).set(updates).commit()` for updates
- `writeClient.delete(id)` for deletions
- `revalidatePath()` after mutations to update cached pages
- Revalidate BOTH admin and public paths when changes affect directory
- Return structured results: `{ success, error, errors }` for client handling

**Source:** [Next.js Server Actions](https://nextjs.org/docs/app/getting-started/updating-data), [Sanity HTTP PATCH API](https://www.sanity.io/docs/http-patches)

### Pattern 5: Action Buttons with useActionState

**What:** Create action buttons (approve, reject, delete) that use useActionState for pending states and error handling.

**When to use:** For member management actions in admin interface.

**Example:**
```typescript
// app/admin/members/components/MemberRow.tsx
'use client'

import { useActionState } from 'react'
import { approveMember, rejectMember } from '@/app/actions/members'

export default function MemberRow({ member }: { member: Member }) {
  const [approveState, approveAction, approvePending] = useActionState(
    async () => await approveMember(member._id),
    null
  )

  const [rejectState, rejectAction, rejectPending] = useActionState(
    async () => await rejectMember(member._id),
    null
  )

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-900">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={urlFor(member.photo).width(50).height(50).url()}
            alt={member.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-sm text-gray-400">{member.jobTitle}</p>
          </div>
        </div>
      </td>
      <td className="p-4 text-sm text-gray-400">
        {member.company || '—'}
      </td>
      <td className="p-4 text-sm text-gray-400">
        {new Date(member.submittedAt).toLocaleDateString()}
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <form action={approveAction}>
            <button
              type="submit"
              disabled={approvePending}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded text-sm font-medium transition-colors"
            >
              {approvePending ? 'Approving...' : 'Approve'}
            </button>
          </form>

          <form action={rejectAction}>
            <button
              type="submit"
              disabled={rejectPending}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded text-sm font-medium transition-colors"
            >
              {rejectPending ? 'Rejecting...' : 'Reject'}
            </button>
          </form>
        </div>

        {approveState?.error && (
          <p className="text-xs text-red-400 mt-1">{approveState.error}</p>
        )}
        {rejectState?.error && (
          <p className="text-xs text-red-400 mt-1">{rejectState.error}</p>
        )}
      </td>
    </tr>
  )
}
```

**Key patterns:**
- `useActionState` returns `[state, action, pending]` tuple
- Wrap Server Action in async wrapper to pass member ID
- Show pending state: `{pending ? 'Loading...' : 'Label'}`
- Disable buttons during pending to prevent duplicate submissions
- Display errors from action return value

**Source:** [React useActionState](https://react.dev/reference/react/useActionState), [Next.js Forms](https://nextjs.org/docs/app/guides/forms), Existing `app/admin/login/page.tsx`

### Anti-Patterns to Avoid

- **Don't fetch members client-side for public directory:** Server Components eliminate loading states and reduce bundle size. Client fetching adds unnecessary complexity.

- **Don't bypass status filtering in GROQ queries:** Always filter `status == "approved"` for public queries. Forgetting this filter exposes pending/rejected members, violating privacy requirements.

- **Don't forget revalidatePath after mutations:** Sanity mutations don't auto-revalidate Next.js cache. Without revalidation, public directory shows stale data until cache expires.

- **Don't use writeClient in Client Components:** writeClient contains SANITY_WRITE_TOKEN which must never be exposed to browsers. Only import in Server Actions and Server Components with 'server-only'.

- **Don't build complex data grids for small datasets:** For 100-200 members, simple table markup with basic sorting suffices. TanStack Table adds unnecessary complexity and bundle size.

- **Don't use Sanity's live preview in production:** Live preview is for Studio integration. Public directory should use CDN-cached queries for performance.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Custom image resizing/CDN | Sanity image CDN with urlFor() | Handles automatic format selection (WebP/AVIF), responsive sizes, hotspot cropping, and global CDN caching. Building this requires image processing libraries and edge infrastructure. |
| Responsive images | Multiple img tags with srcset | Sanity .auto('format').width() | Sanity CDN automatically serves optimal formats and sizes based on device capabilities. Manual srcset requires maintaining multiple size configurations. |
| Data table pagination | Custom pagination logic | Server Component with simple limit/offset | For hundreds of rows, simple pagination with GROQ `[0...50]` slicing suffices. Complex pagination libraries add overhead for minimal benefit. |
| Real-time updates | WebSocket/polling for member updates | Revalidation after mutations | Member approval is infrequent (admin-triggered). revalidatePath provides sufficient freshness without WebSocket complexity. |
| Member search | Client-side filtering | GROQ full-text search or simple includes() | GROQ supports text search operators. For small datasets, client-side Array.filter() works. Don't build custom search indexing. |

**Key insight:** Sanity's image CDN is production-grade infrastructure that handles edge cases like EXIF rotation, color profiles, and format negotiation. The urlFor() builder API exposes this power simply. Custom image handling requires infrastructure expertise and ongoing maintenance.

## Common Pitfalls

### Pitfall 1: Forgetting status filter in public queries

**What goes wrong:** Public directory shows pending or rejected members, violating privacy requirements DIR-04.

**Why it happens:** Developer copies query from admin context where all statuses are needed, or forgets to add filter when creating new query.

**How to avoid:**
- Always include `&& status == "approved"` in public member queries
- Create helper function `getApprovedMembers()` that encapsulates filter
- Add TypeScript type that requires status parameter
- Review all member queries during code review

**Warning signs:** Member count on public page higher than approved count in admin dashboard. Pending members appear in directory.

**Sources:** Existing `lib/sanity/queries.ts`, Phase 1 privacy-first architecture decision

### Pitfall 2: Not revalidating paths after approval

**What goes wrong:** Admin approves member but public directory doesn't update until cache expires (could be hours). Member appears approved in admin but missing from public page.

**Why it happens:** Forgetting to call `revalidatePath('/members')` after approval action. Only revalidating admin path.

**How to avoid:**
- Revalidate BOTH `/admin/members` and `/members` after approval/edit/delete
- Create helper function `revalidateMemberPaths()` that revalidates all affected paths
- Test by approving member and immediately checking public directory
- Consider using `revalidateTag('members')` for fine-grained control

**Warning signs:** Approved member doesn't appear in public directory immediately. Hard refresh shows member but normal navigation doesn't.

**Sources:** [Next.js revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)

### Pitfall 3: Exposing write token in client bundle

**What goes wrong:** SANITY_WRITE_TOKEN leaked in browser console or bundle. Attackers can modify/delete all Sanity content.

**Why it happens:** Importing writeClient in Client Component, or accessing write token in code that gets bundled.

**How to avoid:**
- Import 'server-only' at top of files using writeClient
- Only use writeClient in Server Actions and Server Components
- NEVER pass write token to client as prop or environment variable with NEXT_PUBLIC_ prefix
- Verify write token is in .env (NOT .env.local which could be committed)

**Warning signs:** Build warnings about server-only modules. Write token visible in Network tab or Sources.

**Sources:** [Server-Only Package](https://www.npmjs.com/package/server-only), Existing `lib/sanity/write-client.ts`

### Pitfall 4: Hotspot not working on images

**What goes wrong:** Member photos have wrong focal point - heads cut off, faces not centered, especially on mobile.

**Why it happens:** Photo field doesn't have `options: { hotspot: true }` in schema, or urlFor() doesn't use .fit('crop').

**How to avoid:**
- Verify member schema has `hotspot: true` option (already present in existing schema)
- Use `.fit('crop')` when generating URLs for fixed-size images
- Test with landscape photos to verify focal point preservation
- Educate admins to set hotspot in Studio when uploading photos

**Warning signs:** Member photos look good on desktop but poorly cropped on mobile. Faces not centered in circular avatars.

**Sources:** [@sanity/image-url fit modes](https://www.sanity.io/docs/image-url), Existing `lib/sanity/schemas/member.ts`

### Pitfall 5: Race conditions with concurrent approvals

**What goes wrong:** Two admins approve same member simultaneously. One approval succeeds, other gets stale document error or overwrites timestamp.

**Why it happens:** Sanity patch operations don't use optimistic locking by default. Both admins fetch member at same state, both patch independently.

**How to avoid:**
- For this use case, race condition impact is minimal (both approvals succeed, timestamps slightly different)
- If strict ordering needed, use Sanity transactions with conditional patches
- Alternative: Use document revision ID in patch to detect conflicts
- For Phase 5 scope, accept minor timestamp variance (low risk with 2-3 admins)

**Warning signs:** ApprovedAt timestamps don't match in Sanity vs displayed value. Multiple approval notifications for same member.

**Sources:** [Sanity HTTP PATCH optimistic locking](https://www.sanity.io/docs/http-patches)

### Pitfall 6: Inconsistent member counts between admin and public

**What goes wrong:** Admin dashboard shows "5 approved members" but public directory shows 3 members.

**Why it happens:** Admin query counts documents but public query filters additional fields that cause GROQ to exclude some results. Or revalidation failed to clear cache.

**How to avoid:**
- Use identical GROQ query structure for counting and fetching
- Count query: `count(*[_type == "member" && status == "approved"])`
- Fetch query: `*[_type == "member" && status == "approved"]`
- Test count after each approval to verify increment
- Check Network tab to verify queries executed (not cached)

**Warning signs:** Counts don't increment after approval. Discrepancy between admin stats and public display.

**Sources:** [GROQ count() aggregation](https://www.sanity.io/docs/groq-functions#count-d5601a82efae)

## Code Examples

Verified patterns from official sources and existing codebase:

### Public Member Directory Page (Server Component)
```typescript
// app/(public)/members/page.tsx
import { client } from '@/lib/sanity/client'
import MemberGrid from '@/components/MemberGrid'

export const metadata = {
  title: 'Member Directory | Checkmate & Connect',
  description: 'Browse our community of 200+ chess enthusiasts and entrepreneurs in Casablanca.',
}

export default async function MembersPage() {
  // Fetch approved members with GROQ (Server Component)
  const members = await client.fetch(
    `*[_type == "member" && status == "approved"] | order(approvedAt desc) {
      _id,
      name,
      slug,
      photo,
      jobTitle,
      company,
      linkedIn,
      approvedAt
    }`
  )

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Member Directory
          </h1>
          <p className="text-lg text-gray-400">
            {members.length} approved members
          </p>
        </div>

        {members.length === 0 ? (
          <p className="text-center text-gray-500">
            No approved members yet. Check back soon!
          </p>
        ) : (
          <MemberGrid members={members} />
        )}
      </div>
    </main>
  )
}
```

**Source:** Next.js App Router patterns, existing `app/(public)/join/page.tsx`

### Admin Dashboard with Member Stats
```typescript
// app/admin/page.tsx - Updated with real stats
import { verifySession } from '@/lib/auth/dal'
import { client } from '@/lib/sanity/client'
import Link from 'next/link'

export default async function AdminDashboard() {
  await verifySession()

  // Fetch member counts by status
  const [pendingCount, approvedCount, recentCount] = await Promise.all([
    client.fetch(`count(*[_type == "member" && status == "pending"])`),
    client.fetch(`count(*[_type == "member" && status == "approved"])`),
    client.fetch(`count(*[_type == "member" && approvedAt > $weekAgo])`, {
      weekAgo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pending Members"
          value={pendingCount}
          description="Awaiting approval"
          href="/admin/members?status=pending"
          highlight={pendingCount > 0}
        />
        <StatCard
          title="Total Members"
          value={approvedCount}
          description="All approved members"
          href="/admin/members?status=approved"
        />
        <StatCard
          title="Recent Activity"
          value={recentCount}
          description="Approved last 7 days"
        />
      </div>

      {/* Quick actions */}
      {pendingCount > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Pending Review</h2>
          <p className="text-gray-400 text-sm mb-4">
            {pendingCount} member{pendingCount !== 1 ? 's' : ''} waiting for approval
          </p>
          <Link
            href="/admin/members?status=pending"
            className="inline-block bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
          >
            Review Submissions
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, description, href, highlight }: {
  title: string
  value: number
  description: string
  href?: string
  highlight?: boolean
}) {
  const content = (
    <div className={`bg-gray-900 border rounded-lg p-6 ${highlight ? 'border-blue-600' : 'border-gray-800'}`}>
      <h2 className="text-sm font-medium text-gray-400 mb-2">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
  )

  return href ? <Link href={href}>{content}</Link> : content
}
```

**Source:** Existing `app/admin/page.tsx` placeholder structure

### Sanity Image URL Builder Utility
```typescript
// lib/sanity/imageUrl.ts (existing file)
import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Usage in components:
// urlFor(member.photo).width(400).height(400).fit('crop').auto('format').url()
```

**Source:** Existing `lib/sanity/imageUrl.ts`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side member fetching | Server Components with GROQ | React 18+ (2022) | Eliminates loading states, reduces bundle size, improves SEO. Members indexed by search engines. |
| Manual image srcset | Sanity .auto('format') | 2023 | Automatic WebP/AVIF delivery to supporting browsers. 30-50% smaller images with zero config. |
| Complex data grid libraries | Simple Server Component tables | 2024-2026 | For admin interfaces with <500 rows, HTML tables with basic sorting outperform heavy libraries. Faster page loads. |
| useFormState (React 18) | useActionState (React 19) | React 19.0 (2024) | Simplified API, better TypeScript support, renamed to match semantic purpose. |
| Separate mutation endpoints | Server Actions | Next.js 13+ (2023) | Co-locate mutations with components, automatic CSRF protection, progressive enhancement. |

**Deprecated/outdated:**
- **Client-side SWR/React Query for public content:** Server Components are now standard for SEO-critical pages. Client libraries better for user-specific dashboards.
- **useFormState:** Renamed to useActionState in React 19. Same functionality, clearer naming.
- **Image components with manual srcset:** Sanity CDN handles responsive images automatically via URL parameters.
- **Imperative cache invalidation:** revalidatePath/revalidateTag are declarative, simpler than manual cache keys.

**Sources:** [React 19 Release](https://react.dev/blog/2025/10/01/react-19-2), [Next.js App Router](https://nextjs.org/docs/app)

## Open Questions

1. **Member profile detail pages**
   - What we know: Requirements specify directory listing with basic info (name, photo, title, company, LinkedIn).
   - What's unclear: Should clicking a member open detail page with full bio, or just link to LinkedIn?
   - Recommendation: Phase 5 implements grid listing with LinkedIn links only. Detail pages could be Phase 7 enhancement if needed.

2. **Rejection reason communication**
   - What we know: ADMIN-05 requires admins can reject with reason.
   - What's unclear: Should rejected members receive email notification with reason? Or is reason admin-internal only?
   - Recommendation: Phase 5 stores rejection reason in Sanity document (admin-visible). Email notification could be Phase 7 if user requests it.

3. **Bulk operations for admins**
   - What we know: Admins need to approve/reject members individually per ADMIN-04, ADMIN-05.
   - What's unclear: With 100+ pending submissions, should admins be able to bulk approve/reject?
   - Recommendation: Phase 5 implements one-at-a-time operations. Bulk actions could be added if admin feedback indicates need.

4. **Member directory search/filtering**
   - What we know: DIR-01 requires browsing all approved members. No search requirement specified.
   - What's unclear: With 200+ members, should visitors be able to filter by industry, location, or search by name?
   - Recommendation: Phase 5 implements basic scrollable grid. Search/filter could be Phase 7 enhancement based on user feedback.

5. **Image upload in edit flow**
   - What we know: ADMIN-06 requires admins can edit existing member profiles.
   - What's unclear: Can admins replace member photos, or only edit text fields?
   - Recommendation: Phase 5 allows editing text fields only. Photo replacement could be added if admin workflow requires it (rare use case).

## Sources

### Primary (HIGH confidence)
- [Next.js Data Fetching Guide](https://nextjs.org/docs/app/getting-started/fetching-data) - Official Server Component patterns
- [Next.js Server Actions](https://nextjs.org/docs/app/getting-started/updating-data) - Official mutation patterns with revalidation
- [Sanity HTTP PATCH API](https://www.sanity.io/docs/http-patches) - Official patch operations documentation
- [@sanity/image-url Documentation](https://www.sanity.io/docs/image-url) - Official image CDN API
- [React useActionState](https://react.dev/reference/react/useActionState) - Official React 19 hook documentation
- [GROQ Query Language](https://www.sanity.io/docs/groq) - Official GROQ syntax and operators
- Existing codebase: `lib/sanity/schemas/member.ts`, `lib/sanity/queries.ts`, `components/MemberHighlights.tsx`

### Secondary (MEDIUM confidence)
- [React Stack Patterns 2026](https://www.patterns.dev/react/react-2026/) - Server Components best practices
- [React Server Components Practical Guide](https://inhaq.com/blog/react-server-components-practical-guide-2026.html) - RSC architecture patterns
- [Markus Oberlehner: React Hook Form with useActionState](https://markus.oberlehner.net/blog/using-react-hook-form-with-react-19-use-action-state-and-next-js-15-app-router) - Integration patterns verified by community
- [Pagination UI Best Practices 2026](https://www.eleken.co/blog-posts/pagination-ui) - UX patterns for data tables
- [Data Table Design UX Patterns](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables) - Enterprise table design patterns

### Tertiary (LOW confidence)
- WebSearch results on React data grids - Library comparison, not architectural guidance
- Medium articles on Next.js forms - Community patterns, not official recommendations
- Admin dashboard templates - UI inspiration but may use outdated approaches

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json, versions verified, patterns established in existing code
- Architecture: HIGH - Patterns sourced from official Next.js and Sanity documentation, validated against existing codebase patterns
- Pitfalls: MEDIUM - Combination of official docs warnings and anticipated issues based on schema/architecture review

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (30 days - stable CMS and framework patterns)

**Key technologies researched:**
- Next.js 16.1.6 App Router (stable)
- React 19.0.0 Server Components (stable)
- Sanity v3 with @sanity/client 7.14.1 (stable)
- @sanity/image-url 2.0.3 (stable)
- next-sanity 12.1.0 (stable)
- React Hook Form 7.71.1 (stable)
- Tailwind CSS 4.0.0 (stable)
