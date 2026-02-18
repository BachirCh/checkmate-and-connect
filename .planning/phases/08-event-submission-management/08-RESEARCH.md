# Phase 8: Event Submission & Management - Research

**Researched:** 2026-02-18
**Domain:** Event management system with Sanity CMS, recurring vs one-time events, public submission workflow
**Confidence:** HIGH

## Summary

Phase 8 implements a public event submission and management system following the proven patterns from Phase 3 (member submission) and Phase 5 (admin approval workflow). The key technical challenge is modeling recurring events ("every Saturday 10AM") vs punctual/one-time events (specific date/time) while maintaining a simple, maintainable schema.

The implementation mirrors the member submission architecture: public form without authentication → spam protection (reCAPTCHA v3 + honeypot + rate limiting) → creates pending entry in Sanity → admin approval workflow → public display with time-based filtering (upcoming vs all events). Event-specific additions include time pattern handling (recurrent text description OR specific datetime), event status computation (upcoming/ended based on datetime comparison with `now()`), and dual sections for displaying filtered events.

Research findings recommend a **pragmatic approach**: store recurring events as human-readable text patterns ("Every Saturday at 10:00 AM") rather than complex RRULE specifications, avoiding the maintenance burden of recurring date calculation libraries. For one-time events, use Sanity's native `datetime` field. Admin approval workflow reuses existing Server Action patterns from Phase 5, with GROQ queries using `now()` function for time-based filtering.

**Primary recommendation:** Use simple text field for recurring event patterns (human-readable, admin-friendly) combined with datetime field for one-time events. Implement dual-status architecture: admin approval status (pending/approved/rejected) + computed time status (upcoming/ended). Follow Phase 3 spam protection and Phase 5 admin workflow patterns for consistency.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Sanity CMS v3 | 3.67.0 | Event schema storage with approval workflow | Already configured, proven in Phase 3 & 5 |
| `@sanity/image-url` | 2.0.3 | Event image optimization | Existing pattern from members/blog |
| React Hook Form | 7.x | Client-side form validation | Already used in Phase 3 member submission |
| Zod | 3.x | Shared validation schema | Consistent with Phase 3 pattern |
| Next.js Server Actions | 16.1.6 | Event submission and admin operations | Proven in Phase 3 & 5 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns` | 3.x | Datetime formatting and comparison | Optional - native JS Date methods may suffice |
| `rrule` | 2.8.1 | Complex recurring event calculations | **NOT RECOMMENDED** - overkill for simple patterns |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Simple text field for recurrence | RRULE library + parsing | RRULE adds complexity and maintenance burden for minimal benefit; text is admin-friendly |
| Native `datetime` field | String with manual parsing | Sanity `datetime` provides built-in Studio UI and validation |
| Computed time status (upcoming/ended) | Stored status field requiring cron updates | Computed status is always accurate, no background jobs needed |

**Installation:**
```bash
# No new packages required - all dependencies already installed
# Optional: date-fns if datetime formatting needs are complex
npm install date-fns  # OPTIONAL
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (public)/
│   └── events/
│       ├── page.tsx              # Events listing with upcoming/all sections
│       └── submit/
│           ├── page.tsx          # Public event submission form
│           └── confirmation/
│               └── page.tsx      # Submission confirmation
├── admin/
│   └── events/
│       └── page.tsx              # Admin event management with approval workflow
├── actions/
│   └── events.ts                 # Server Actions for CRUD + approval

lib/
├── sanity/
│   └── schemas/
│       └── event.ts              # Event schema with recurrence + datetime fields
└── validations/
    └── event-submission.ts       # Zod validation schema

components/
├── EventCard.tsx                 # Event card for listing (upcoming/all views)
├── forms/
│   └── EventSubmissionForm.tsx  # Client component with validation
└── admin/
    └── events/
        ├── EventTable.tsx        # Admin table view
        ├── EventRow.tsx          # Row with approve/reject/delete actions
        └── FilterTabs.tsx        # Filter by status or time (upcoming/past)
```

### Pattern 1: Hybrid Event Time Schema (Simple Recurrence + One-Time)
**What:** Store recurring events as human-readable text; one-time events as datetime field
**When to use:** Event systems needing both recurring and punctual events without complex scheduling
**Example:**
```typescript
// Source: Research findings + Sanity schema best practices
// lib/sanity/schemas/event.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Event Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          { title: 'One-Time Event', value: 'one-time' },
          { title: 'Recurring Event', value: 'recurring' },
        ],
        layout: 'radio',
      },
      initialValue: 'one-time',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventDateTime',
      title: 'Event Date & Time',
      type: 'datetime',
      description: 'For one-time events only',
      hidden: ({ parent }) => parent?.eventType !== 'one-time',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const eventType = (context.parent as any)?.eventType;
          if (eventType === 'one-time' && !value) {
            return 'Date & time required for one-time events';
          }
          return true;
        }),
    }),
    defineField({
      name: 'recurrencePattern',
      title: 'Recurrence Pattern',
      type: 'string',
      description: 'Human-readable pattern (e.g., "Every Saturday at 10:00 AM")',
      placeholder: 'Every Saturday at 10:00 AM',
      hidden: ({ parent }) => parent?.eventType !== 'recurring',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const eventType = (context.parent as any)?.eventType;
          if (eventType === 'recurring' && !value) {
            return 'Recurrence pattern required for recurring events';
          }
          return true;
        }),
    }),
    defineField({
      name: 'author',
      title: 'Event Organizer / Author',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Approval Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      subtitle: 'author',
      eventType: 'eventType',
      eventDateTime: 'eventDateTime',
      recurrencePattern: 'recurrencePattern',
    },
    prepare({ title, media, subtitle, eventType, eventDateTime, recurrencePattern }) {
      const timeInfo =
        eventType === 'recurring'
          ? recurrencePattern
          : eventDateTime
          ? new Date(eventDateTime).toLocaleDateString()
          : 'No time set';
      return {
        title,
        media,
        subtitle: `${subtitle} • ${timeInfo}`,
      };
    },
  },
});
```

**Why this approach:**
- **Simple and maintainable:** No complex date calculation libraries needed
- **Admin-friendly:** Admins can read/edit patterns directly ("Every Saturday at 10 AM")
- **Flexible:** Supports any recurrence pattern without rigid RRULE constraints
- **No background jobs:** Recurring events don't need instance generation
- **Display-focused:** For display purposes only, not calendar integration (aligns with project scope)

### Pattern 2: GROQ Query for Upcoming vs All Events
**What:** Use `now()` function to filter events by time status
**When to use:** Separating upcoming events from past events in public views
**Example:**
```typescript
// Source: Sanity GROQ datetime filtering docs
// app/(public)/events/page.tsx

// UPCOMING EVENTS QUERY
// For one-time events: eventDateTime > now()
// For recurring events: always show (they're ongoing)
const upcomingEventsQuery = `*[
  _type == "event"
  && status == "approved"
  && (
    eventType == "recurring"
    || dateTime(eventDateTime) > dateTime(now())
  )
] | order(eventDateTime asc) {
  _id,
  title,
  slug,
  image,
  description,
  eventType,
  eventDateTime,
  recurrencePattern,
  author
}`;

// ALL EVENTS QUERY
// Show all approved events regardless of time
const allEventsQuery = `*[
  _type == "event"
  && status == "approved"
] | order(eventDateTime desc) {
  _id,
  title,
  slug,
  image,
  description,
  eventType,
  eventDateTime,
  recurrencePattern,
  author
}`;

export default async function EventsPage() {
  const [upcomingEvents, allEvents] = await Promise.all([
    client.fetch(upcomingEventsQuery),
    client.fetch(allEventsQuery),
  ]);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Upcoming Events Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No upcoming events. Check back soon!</p>
        )}
      </section>

      {/* All Events Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">All Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((event) => (
            <EventCard key={event._id} event={event} showStatus />
          ))}
        </div>
      </section>
    </main>
  );
}
```

**Key datetime filtering patterns:**
- `dateTime(eventDateTime) > dateTime(now())` - future events only
- `dateTime(eventDateTime) < dateTime(now())` - past events only
- `dateTime(eventDateTime) >= dateTime(now())` - future + happening now
- Recurring events: always included in upcoming (no end date)

### Pattern 3: Public Event Submission Form (No Auth Required)
**What:** Reuse Phase 3 member submission pattern for event submissions
**When to use:** Public event submission without authentication barrier
**Example:**
```typescript
// Source: Phase 3 member submission pattern
// app/(public)/events/submit/page.tsx + components/forms/EventSubmissionForm.tsx

// Validation schema (lib/validations/event-submission.ts)
import { z } from 'zod';

export const eventSubmissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(500),
  eventType: z.enum(['one-time', 'recurring']),
  eventDateTime: z.string().optional(), // ISO datetime string
  recurrencePattern: z.string().optional(),
  author: z.string().min(2, 'Organizer name required').max(100),
  image: z.instanceof(File).optional(), // Image optional
  recaptchaToken: z.string().min(1),
  _honey: z.string().optional(), // Honeypot
}).refine(
  (data) => {
    if (data.eventType === 'one-time') {
      return !!data.eventDateTime;
    }
    if (data.eventType === 'recurring') {
      return !!data.recurrencePattern;
    }
    return false;
  },
  {
    message: 'Event time information required',
    path: ['eventDateTime'],
  }
);

// Server Action (app/actions/events.ts)
'use server'

import 'server-only';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeClient } from '@/lib/sanity/write-client';
import { checkHoneypot, verifyRecaptcha, rateLimit } from '@/lib/spam-protection';

export async function submitEventAction(prevState: any, formData: FormData) {
  // Extract fields
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const eventType = formData.get('eventType') as string;
  const eventDateTime = formData.get('eventDateTime') as string;
  const recurrencePattern = formData.get('recurrencePattern') as string;
  const author = formData.get('author') as string;
  const image = formData.get('image') as File | null;
  const recaptchaToken = formData.get('recaptchaToken') as string;
  const honey = formData.get('_honey') as string;

  // Three-layer spam protection (Phase 3 pattern)
  const formDataObj = { _honey: honey };
  if (checkHoneypot(formDataObj)) {
    // Silent rejection - don't tell bot it was caught
    return { success: false, error: 'Submission failed' };
  }

  const rateLimitResult = rateLimit('event_submission', 5, 60000);
  if (!rateLimitResult.allowed) {
    return { success: false, error: 'Too many submissions. Please try again later.' };
  }

  const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'event_submission');
  if (!recaptchaResult.success) {
    return { success: false, error: 'Verification failed. Please try again.' };
  }

  // Validate with Zod
  // ... validation logic ...

  try {
    // Upload image if provided (Phase 3 pattern)
    let imageAsset = null;
    if (image && image.size > 0) {
      const imageBuffer = await image.arrayBuffer();
      imageAsset = await writeClient.assets.upload('image', Buffer.from(imageBuffer), {
        filename: image.name,
        contentType: image.type,
      });
    }

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create event document
    const event = await writeClient.create({
      _type: 'event',
      title,
      slug: { _type: 'slug', current: slug },
      description,
      eventType,
      ...(eventType === 'one-time' && { eventDateTime }),
      ...(eventType === 'recurring' && { recurrencePattern }),
      author,
      ...(imageAsset && {
        image: {
          _type: 'image',
          asset: { _type: 'reference', _ref: imageAsset._id },
        },
      }),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });

    // Redirect to confirmation (outside try/catch - Next.js redirect throws internally)
  } catch (error) {
    console.error('Event submission error:', error);
    return { success: false, error: 'Failed to submit event. Please try again.' };
  }

  redirect('/events/submit/confirmation');
}
```

### Pattern 4: Admin Approval Workflow
**What:** Reuse Phase 5 admin member management pattern for event approval
**When to use:** Admin reviewing and approving/rejecting event submissions
**Example:**
```typescript
// Source: Phase 5 member management pattern
// app/actions/events.ts (admin actions)

export async function approveEvent(eventId: string) {
  await verifySession(); // Admin auth check

  try {
    await writeClient
      .patch(eventId)
      .set({
        status: 'approved',
        approvedAt: new Date().toISOString(),
      })
      .commit();

    // Revalidate both admin and public pages
    revalidatePath('/admin/events');
    revalidatePath('/events');

    return { success: true };
  } catch (error) {
    console.error('Approve event error:', error);
    return { success: false, error: 'Failed to approve event' };
  }
}

export async function rejectEvent(eventId: string, reason?: string) {
  await verifySession();

  try {
    await writeClient
      .patch(eventId)
      .set({
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'Did not meet approval criteria',
      })
      .commit();

    revalidatePath('/admin/events');

    return { success: true };
  } catch (error) {
    console.error('Reject event error:', error);
    return { success: false, error: 'Failed to reject event' };
  }
}

export async function deleteEvent(eventId: string) {
  await verifySession();

  try {
    await writeClient.delete(eventId);

    // Revalidate both admin and public pages (if event was approved)
    revalidatePath('/admin/events');
    revalidatePath('/events');

    return { success: true };
  } catch (error) {
    console.error('Delete event error:', error);
    return { success: false, error: 'Failed to delete event' };
  }
}
```

### Pattern 5: EventCard Component with Time Display
**What:** Display event time information differently for recurring vs one-time events
**When to use:** Event listing pages (upcoming/all sections)
**Example:**
```typescript
// components/EventCard.tsx
import { urlFor } from '@/lib/sanity/imageUrl';

type EventCardProps = {
  event: {
    _id: string;
    title: string;
    slug: { current: string };
    image?: any;
    description: string;
    eventType: 'one-time' | 'recurring';
    eventDateTime?: string;
    recurrencePattern?: string;
    author: string;
  };
  showStatus?: boolean; // Show "Ended" badge for past events
};

export default function EventCard({ event, showStatus }: EventCardProps) {
  const imageUrl = event.image
    ? urlFor(event.image).width(600).height(400).fit('crop').auto('format').url()
    : null;

  // Compute if event is past (one-time only)
  const isPast =
    event.eventType === 'one-time' &&
    event.eventDateTime &&
    new Date(event.eventDateTime) < new Date();

  // Format datetime for display
  const displayTime =
    event.eventType === 'recurring'
      ? event.recurrencePattern
      : event.eventDateTime
      ? new Date(event.eventDateTime).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      : 'Time TBD';

  return (
    <article className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
      {imageUrl && (
        <img src={imageUrl} alt={event.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-6">
        {showStatus && isPast && (
          <span className="inline-block px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded mb-2">
            Ended
          </span>
        )}
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
        <p className="text-gray-400 text-sm mb-3">{displayTime}</p>
        <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>
        <p className="text-sm text-gray-500">Organized by {event.author}</p>
      </div>
    </article>
  );
}
```

### Anti-Patterns to Avoid
- **Using RRULE library for simple patterns:** Overkill for "Every Saturday" - adds complexity, maintenance burden, and bundle size
- **Storing computed "ended" status:** Always compute from datetime comparison with `now()` to ensure accuracy
- **Generating event instances for recurring events:** Not needed for display-only use case; increases storage and complexity
- **Requiring authentication for event submission:** Increases friction; follow Phase 3 pattern (no auth, spam protection instead)
- **Manual timezone conversion:** Store in UTC (Sanity datetime does this), display in user's local timezone on client
- **Complex recurrence UI with multiple fields:** Single text field is simpler and more flexible than frequency/interval/day dropdowns

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Recurring event calculation (RRULE parsing) | Custom date generator with repeat logic | **Don't use rrule library either** - store text only | Display-only use case doesn't need instance generation; text is simpler |
| Spam protection | Custom bot detection | Existing three-layer system (Phase 3) | Already tested with reCAPTCHA v3 + honeypot + rate limiting |
| Image upload to Sanity | Custom file handling | `writeClient.assets.upload()` | Sanity CDN handles optimization, hotspots, focal points |
| Admin authorization | Custom session checks | `verifySession()` from Phase 4 | Already implemented with Supabase auth |
| Form validation | Manual validation | Zod schema shared client/server | Type-safe, DRY, prevents validation drift |
| Datetime filtering in queries | Client-side filtering | GROQ `now()` and `dateTime()` functions | Server-side filtering is faster and more accurate |

**Key insight:** Event management systems have two distinct complexity levels: (1) Display-only (show events to users) and (2) Calendar integration (sync to Google Calendar, generate iCal files, etc.). This project needs display-only functionality. Using RRULE or complex recurrence libraries is over-engineering for display purposes. Simple text patterns ("Every Saturday at 10 AM") are sufficient, maintainable, and admin-friendly.

## Common Pitfalls

### Pitfall 1: Over-Engineering Recurrence Logic
**What goes wrong:** Implementing RRULE parsing, recurrence instance generation, and complex date calculations for a display-only use case.
**Why it happens:** Developers assume "recurring events" requires full calendar system like Outlook or Google Calendar.
**How to avoid:** Recognize this is a display-focused system, not calendar sync. Store human-readable text patterns; let admins type "Every Saturday at 10 AM" directly. No parsing or instance generation needed.
**Warning signs:** Adding `rrule` npm package, building recurrence rules UI with multiple dropdowns, discussing "until dates" or "exception dates."

### Pitfall 2: Missing `now()` Filter for Upcoming Events
**What goes wrong:** "Upcoming events" section shows past one-time events because query doesn't filter by datetime.
**Why it happens:** Forgetting to add `dateTime(eventDateTime) > dateTime(now())` condition in GROQ query.
**How to avoid:** Always include time comparison for one-time events. Recurring events can be treated as always "upcoming" (since they repeat indefinitely).
**Warning signs:** Past events appearing in "Upcoming" section, user confusion about what "upcoming" means.

### Pitfall 3: Storing "Ended" Status Instead of Computing
**What goes wrong:** Adding `ended` boolean field to schema and requiring background job or manual update to mark events as ended.
**Why it happens:** Thinking of status as stored data rather than computed property.
**How to avoid:** Always compute ended status in real-time by comparing `eventDateTime` with `now()`. This ensures accuracy without maintenance.
**Warning signs:** Planning a cron job to update event statuses, discussing "how often should we check for ended events."

### Pitfall 4: Not Revalidating Public Pages After Approval
**What goes wrong:** Admin approves event but it doesn't appear on public `/events` page until next deployment.
**Why it happens:** Forgetting to `revalidatePath('/events')` in approval Server Action.
**How to avoid:** Follow Phase 5 pattern - revalidate BOTH admin and public paths after any mutation (approve/reject/delete/edit).
**Warning signs:** Admin reporting "I approved the event but it's not showing up on the site."

### Pitfall 5: Image Upload Without Size/Type Validation
**What goes wrong:** Users upload 50MB images or non-image files, breaking the form or causing upload failures.
**Why it happens:** Trusting browser file input without server-side validation.
**How to avoid:** Follow Phase 3 pattern - validate file size (max 5MB), file type (image/jpeg, image/png, image/webp) on both client (React Hook Form) and server (Server Action).
**Warning signs:** Upload errors, slow submissions, Sanity API rejecting files.

### Pitfall 6: Timezone Hydration Mismatch
**What goes wrong:** Server renders "Feb 18, 2026" but client hydrates to "Feb 17, 2026" due to timezone difference, causing React hydration error.
**Why it happens:** Server uses UTC, client uses user's local timezone for datetime display.
**How to avoid:** Render datetime on client only (using `'use client'` component) OR render UTC on both server and client, then client-side enhance with local timezone.
**Warning signs:** Console warnings about "Text content did not match", datetime flickering on page load.

### Pitfall 7: Forgetting Spam Protection on Public Form
**What goes wrong:** Bot submissions flood the pending events queue with spam entries.
**Why it happens:** Skipping three-layer spam protection from Phase 3 pattern.
**How to avoid:** Always include reCAPTCHA v3 + honeypot + rate limiting on public submission forms. This is non-negotiable.
**Warning signs:** Sudden spike in pending events, suspicious submission content, similar repeated entries.

### Pitfall 8: No Confirmation Page After Submission
**What goes wrong:** After submitting event, user sees blank page or generic redirect, unclear if submission succeeded.
**Why it happens:** Not implementing confirmation page like Phase 3 member submission.
**How to avoid:** Redirect to `/events/submit/confirmation` with clear success message, next steps (e.g., "Your event will be reviewed by admins"), and link back to events page.
**Warning signs:** Users asking "Did my submission work?", duplicate submissions because users retry.

## Code Examples

Verified patterns from official sources and existing codebase:

### GROQ Datetime Comparison
```typescript
// Source: Sanity GROQ documentation
// Upcoming one-time events (future events only)
*[
  _type == "event"
  && eventType == "one-time"
  && dateTime(eventDateTime) > dateTime(now())
]

// Past one-time events
*[
  _type == "event"
  && eventType == "one-time"
  && dateTime(eventDateTime) < dateTime(now())
]

// All approved events (recurring + upcoming one-time)
*[
  _type == "event"
  && status == "approved"
  && (
    eventType == "recurring"
    || dateTime(eventDateTime) > dateTime(now())
  )
]
```

### Event Time Display Formatting
```typescript
// Source: Next.js datetime best practices + date-fns
// Display one-time event datetime
const displayDateTime = (dateTimeString: string) => {
  return new Date(dateTimeString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Display recurring event pattern (no transformation needed)
const displayRecurrence = (pattern: string) => pattern;

// Example outputs:
// One-time: "Saturday, February 18, 2026 at 10:00 AM"
// Recurring: "Every Saturday at 10:00 AM" (as entered by admin)
```

### Conditional Schema Field Visibility
```typescript
// Source: Sanity conditional fields documentation
// Show/hide fields based on eventType selection
defineField({
  name: 'eventDateTime',
  title: 'Event Date & Time',
  type: 'datetime',
  hidden: ({ parent }) => parent?.eventType !== 'one-time',
  validation: (Rule) =>
    Rule.custom((value, context) => {
      const eventType = (context.parent as any)?.eventType;
      if (eventType === 'one-time' && !value) {
        return 'Date & time required for one-time events';
      }
      return true;
    }),
})
```

### Server Action with Spam Protection
```typescript
// Source: Phase 3 member submission pattern
export async function submitEventAction(prevState: any, formData: FormData) {
  // 1. Honeypot check (silent rejection)
  const formDataObj = { _honey: formData.get('_honey') as string };
  if (checkHoneypot(formDataObj)) {
    return { success: false, error: 'Submission failed' };
  }

  // 2. Rate limiting (5 per minute)
  const rateLimitResult = rateLimit('event_submission', 5, 60000);
  if (!rateLimitResult.allowed) {
    return { success: false, error: 'Too many submissions. Please try again later.' };
  }

  // 3. reCAPTCHA verification (score >= 0.5)
  const recaptchaToken = formData.get('recaptchaToken') as string;
  const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'event_submission');
  if (!recaptchaResult.success) {
    return { success: false, error: 'Verification failed. Please try again.' };
  }

  // Continue with validation and Sanity write...
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| RRULE for all recurring events | Simple text for display-only recurring events | 2010s → 2020s | Less complexity, better admin UX for simple cases |
| Stored "active/ended" status | Computed status from datetime | Modern Jamstack era | Always accurate, no background jobs |
| Complex recurrence UI (freq + interval + days) | Single text field for admins | 2020s CMS simplification | Faster to build, easier to maintain |
| Client-side event filtering | GROQ server-side filtering with `now()` | Next.js App Router era | Better performance, less JS shipped |
| Separate form validation client/server | Shared Zod schema | TypeScript era | Type-safe, DRY, prevents validation drift |

**Deprecated/outdated:**
- Full calendar systems (Outlook-style) for simple event displays: Overkill for most community sites
- RRULE parsing in JavaScript: Not needed for display-only use cases
- Manual timezone conversion: Modern browsers handle this with `Intl.DateTimeFormat`
- Storing all possible future event instances: Database bloat, maintenance nightmare

**Current best practices:**
- Pragmatic approach: Use complexity that matches your use case (display vs full calendar sync)
- Compute don't store: Event status (ended/upcoming) computed from datetime, not stored
- Human-readable over machine-parseable: "Every Saturday at 10 AM" better than "FREQ=WEEKLY;BYDAY=SA;BYHOUR=10"
- Server-side filtering: GROQ queries with `now()` for accurate time-based filtering

## Open Questions

1. **Should events have an end datetime for one-time events?**
   - What we know: User requirements specify "time" field but don't mention duration/end time
   - What's unclear: Do events have start + end times, or just a single datetime?
   - Recommendation: Start with single datetime field (simple). If duration needed later, add optional `endDateTime` field. Most community events are "starts at X" not "X to Y duration."

2. **Should recurring events have an "until" date?**
   - What we know: User requirements say "recurring like every Saturday" without mentioning end dates
   - What's unclear: Do recurring events run forever, or do they have an end date?
   - Recommendation: No "until" date in MVP. Admins can delete recurring events when they end. If "until" date needed, add optional `recurrenceEndDate` field later.

3. **Should events link to member directory (author as member reference)?**
   - What we know: Author field is specified, members directory exists
   - What's unclear: Should event author link to member profile if they're in directory?
   - Recommendation: Keep as string for Phase 8 (simpler). If author linking becomes important, refactor to reference field in future phase.

4. **Should users see event detail pages or just cards?**
   - What we know: User requirements mention displaying events but don't specify detail pages
   - What's unclear: Do events have dedicated `/events/[slug]` pages or just cards in listing?
   - Recommendation: Start with listing view only (two sections: upcoming + all). Add detail pages later if description field becomes insufficient (e.g., need longer content, images, attendee lists).

5. **Should we support timezone selection for event authors?**
   - What we know: Community is in Casablanca (UTC+1), single geographic location
   - What's unclear: Will events ever be in different timezones?
   - Recommendation: Store all datetimes in UTC (Sanity default), display in user's local timezone. Don't add timezone selector in MVP (community is co-located). If multi-timezone support needed, add `timezone` field later.

## Sources

### Primary (HIGH confidence)
- Sanity Official Documentation
  - [Event Directory Schemas Recipe](https://www.sanity.io/schemas/event-directory-schemas-add1fe26)
  - [GROQ Functions Reference](https://www.sanity.io/docs/specifications/groq-functions)
  - [Query Cheat Sheet - Datetime Filtering](https://www.sanity.io/docs/content-lake/query-cheat-sheet)
  - [Custom Input Components Guide](https://www.sanity.io/guides/how-to-make-a-custom-input-component)
  - [Filtering Array Events by Date](https://www.sanity.io/answers/filtering-an-array-of-linked-events-based-on-date-in-a-groq-query)
- Existing codebase patterns:
  - `/Users/mac/Documents/Code/C&C/lib/sanity/schemas/member.ts` - Approval status pattern
  - `/Users/mac/Documents/Code/C&C/lib/sanity/schemas/blogPost.ts` - Optional datetime field pattern
  - `/Users/mac/Documents/Code/C&C/lib/spam-protection.ts` - Three-layer spam protection
  - `/Users/mac/Documents/Code/C&C/.planning/phases/03-member-submission-system/03-01-PLAN.md` - Public submission workflow
  - `/Users/mac/Documents/Code/C&C/.planning/phases/05-member-directory-management/05-02-PLAN.md` - Admin approval workflow

### Secondary (MEDIUM confidence)
- [iCalendar RFC 5545 - RRULE Specification](https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html)
- [Schema.org Event Type](https://schema.org/Event)
- [Managing Recurring Events in Node.js with rrule](https://blog.cybermindworks.com/post/managing-recurring-events-in-node-js-with-rrule)
- [Again and Again! Managing Recurring Events In a Data Model](https://www.red-gate.com/blog/again-and-again-managing-recurring-events-in-a-data-model)
- [Next.js Date & Time Localization Guide](https://staarter.dev/blog/nextjs-date-and-time-localization-guide)
- [Displaying Local Times in Next.js](https://francoisbest.com/posts/2023/displaying-local-times-in-nextjs)
- [Spam Protection With Honeypot and Google reCAPTCHA](https://wpmanageninja.com/docs/fluent-form/miscellaneous/spam-protection-with-honeypot-and-google-recaptcha-in-wp-fluent-forms/)

### Tertiary (LOW confidence)
- Various Medium/blog articles on event management UX patterns - general principles only, not implementation-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages already installed and proven in Phases 3-5
- Architecture: HIGH - Patterns directly adapted from existing member submission and blog functionality
- Pitfalls: HIGH - Based on common event system mistakes and lessons from Phase 3/5 implementation
- Open questions: MEDIUM - Recommendations based on MVP principles; user feedback may adjust priorities

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days - stack is stable, patterns are proven)

**Key findings:**
1. **No new dependencies needed** - all functionality achievable with existing stack (Sanity, React Hook Form, Zod, Server Actions)
2. **Pragmatic recurring event approach** - simple text field beats RRULE complexity for display-only use case
3. **Proven patterns apply directly** - Phase 3 (submission) + Phase 5 (approval) patterns cover 90% of requirements
4. **GROQ datetime filtering** - `now()` function provides server-side time-based filtering without client-side computation
5. **Computed vs stored status** - compute "ended" status from datetime comparison, don't store it (always accurate)
6. **Dual-section display** - upcoming (recurring + future one-time) vs all (past + present + future) naturally separates content
7. **No authentication barrier** - follows Phase 3 pattern (public submission + spam protection)
8. **Admin workflow reuse** - Phase 5 approval/reject/delete patterns apply with minimal changes

**Critical architectural decisions:**
- Simple text field for recurring patterns (not RRULE)
- Single datetime field for one-time events (not start + end)
- Computed time status (not stored status field)
- Display-only focus (not calendar sync/integration)
- No event detail pages in MVP (listing view only)
- UTC storage with client-side local timezone display
