---
phase: 08-event-submission-management
plan: 03
subsystem: public-events-listing
tags: [events, frontend, groq, sanity, responsive-design]
dependency_graph:
  requires: [08-01, 08-02]
  provides: [public-events-page, event-time-filtering, event-card-display]
  affects: [sitemap, public-navigation]
tech_stack:
  added: []
  patterns: [groq-datetime-filtering, server-component-parallel-queries, responsive-grid-layout]
key_files:
  created:
    - app/(public)/events/page.tsx
    - components/EventCard.tsx
  modified:
    - lib/sanity/queries.ts
decisions:
  - decision: "Use GROQ now() function for server-side datetime filtering"
    rationale: "Server-side filtering ensures consistent timezone handling and reduces client-side computation"
    alternatives: ["Client-side filtering with JavaScript Date", "Static generation with ISR"]
    impact: "Events always show correct upcoming/past status regardless of client timezone"
  - decision: "Recurring events always appear in Upcoming Events section"
    rationale: "Recurring events have no end date, so they should always be discoverable in upcoming section"
    alternatives: ["Show recurring events only if next occurrence is within X days", "Create separate recurring section"]
    impact: "Users can always find recurring events in the upcoming section, simplifying discovery"
  - decision: "Display recurrencePattern text as-is for recurring events"
    rationale: "Pattern entered by organizer (e.g., 'Every Wednesday at 6 PM') is human-readable and requires no parsing"
    alternatives: ["Parse pattern and format consistently", "Store structured recurrence data"]
    impact: "Flexible pattern text but relies on organizer to write clear descriptions"
metrics:
  duration_minutes: 23
  tasks_completed: 3
  files_created: 2
  files_modified: 1
  commits: 3
  deviations: 0
  completed_date: 2026-02-19
---

# Phase 08 Plan 03: Public Events Listing Summary

**One-liner:** Public events page with GROQ datetime filtering displays upcoming (recurring + future one-time) and all events sections with responsive grid

## What Was Built

Implemented public-facing events listing page at `/events` with dual-section layout:
- **Upcoming Events:** Shows recurring events (always upcoming) and future one-time events using GROQ `now()` filtering
- **All Events:** Complete event history with "Ended" badges on past one-time events
- **EventCard component:** Conditional time display (pattern text for recurring, formatted datetime for one-time)
- **GROQ queries:** Server-side datetime filtering with `dateTime(eventDateTime) > dateTime(now())`
- **Responsive layout:** 1/2/3 column grid at mobile/tablet/desktop breakpoints
- **Call-to-action:** Section encouraging event submissions with link to form

## Architecture Decisions

### 1. GROQ Datetime Filtering with now()
Used Sanity's `dateTime(now())` function in GROQ query for server-side time comparison:
```groq
*[
  _type == "event"
  && status == "approved"
  && (
    eventType == "recurring"
    || dateTime(eventDateTime) > dateTime(now())
  )
]
```

**Benefits:**
- Consistent timezone handling (server UTC)
- No client-side date computation
- Accurate upcoming/past distinction at query time

### 2. Recurring Events Always Upcoming
All recurring events appear in Upcoming Events section regardless of when they were created. Logic: recurring events have no end date, so they're perpetually "upcoming."

**Implementation:** Query includes `eventType == "recurring"` condition separate from datetime check.

### 3. Conditional Time Display
EventCard component displays different time information based on event type:
- **Recurring:** Shows `recurrencePattern` text exactly as entered ("Every Saturday at 10:00 AM")
- **One-time:** Formats `eventDateTime` with `toLocaleDateString()` including weekday, date, time

### 4. Parallel Query Fetching
Both queries (`upcomingEventsQuery` and `allEventsQuery`) fetched in parallel using `Promise.all()` for optimal page load performance.

## Task Completion Record

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create GROQ queries for event filtering | 5ec30bc | lib/sanity/queries.ts |
| 2 | Create EventCard component | c67876a | components/EventCard.tsx |
| 3 | Build public events listing page | 4fea344 | app/(public)/events/page.tsx |

## Deviations from Plan

None - plan executed exactly as written.

All tasks completed successfully with no blocking issues, architectural changes, or missing functionality discovered during execution.

## Verification Results

### Automated Verification
- ✓ Build successful (`npm run build` - 3 times, all passed)
- ✓ Page loads at http://localhost:3000/events (HTTP 200)
- ✓ Upcoming Events section present
- ✓ All Events section present with border-top separator
- ✓ Call-to-action section with "Submit an Event" link
- ✓ Responsive grid CSS classes verified (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- ✓ Submit link navigates to /events/submit (HTTP 200)
- ✓ SEO metadata correct (title: "Events | Checkmate & Connect")

### Manual Verification Pending
The following verification steps from the plan require manual testing or live event data:
1. Submit and approve events via admin panel to verify GROQ filtering logic
2. Test with mix of recurring and one-time events (future/past)
3. Verify "Ended" badges appear on past one-time events in All Events section
4. Test responsive layout at mobile/tablet/desktop widths
5. Verify path revalidation updates page after admin approval
6. Verify Sanity CDN image optimization (WebP/AVIF delivery)

## Technical Highlights

### GROQ Query Pattern
```typescript
export const upcomingEventsQuery = `*[
  _type == "event"
  && status == "approved"
  && (
    eventType == "recurring"
    || dateTime(eventDateTime) > dateTime(now())
  )
] | order(eventDateTime asc)`;
```

**Key features:**
- `now()` function for server-side current time
- Logical OR for recurring vs future one-time events
- `status == "approved"` privacy filter
- Ascending order for soonest-first display

### EventCard Time Display Logic
```typescript
const displayTime =
  event.eventType === 'recurring'
    ? event.recurrencePattern
    : event.eventDateTime
    ? new Date(event.eventDateTime).toLocaleDateString('en-US', {...})
    : 'Time TBD';
```

Conditional rendering based on event type ensures appropriate time information for each event category.

### Responsive Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

Mobile-first responsive design with breakpoints:
- Default (mobile): 1 column
- `md` (768px+): 2 columns
- `lg` (1024px+): 3 columns

## Integration Points

### With Phase 08 Plans
- **08-01 (Event Submission):** Users submit events that appear here after approval
- **08-02 (Admin Management):** Admin approves events, revalidates `/events` path for immediate display

### With Existing Systems
- **Sanity CMS:** Queries event content type with GROQ
- **Image CDN:** urlFor() optimization (600x400 crop, WebP/AVIF)
- **Member pattern:** EventCard follows MemberCard styling conventions (dark theme, hover states)

## Known Limitations

1. **Empty state for All Events:** Currently no message if no events exist at all (only Upcoming Events has empty state)
2. **No pagination:** All events load at once (acceptable for MVP, may need pagination with 100+ events)
3. **No event detail pages:** Cards display full description with line-clamp-3 (detail pages in future phase)
4. **Timezone display:** Client-side formatting uses browser locale (may show different times for users in different timezones)

## Next Steps

Future enhancements (not in current scope):
1. Add event detail pages at `/events/[slug]`
2. Implement pagination for All Events section
3. Add category/tag filtering
4. Add search functionality
5. Add calendar view option
6. Add iCal export for recurring events

## Self-Check: PASSED

**Files created verification:**
```bash
✓ app/(public)/events/page.tsx exists
✓ components/EventCard.tsx exists
✓ lib/sanity/queries.ts modified
```

**Commits verification:**
```bash
✓ 5ec30bc exists (GROQ queries)
✓ c67876a exists (EventCard component)
✓ 4fea344 exists (Events page)
```

**Build verification:**
```bash
✓ TypeScript compilation successful
✓ Route /events appears in build output
✓ All imports resolve correctly
```

All claimed artifacts and commits verified to exist.
