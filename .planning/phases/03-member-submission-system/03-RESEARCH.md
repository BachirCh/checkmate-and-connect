# Phase 3: Member Submission System - Research

**Researched:** 2026-02-15
**Domain:** Form handling with Server Actions, file upload, spam protection, Sanity CMS integration
**Confidence:** HIGH

## Summary

Phase 3 implements a visitor-facing member submission form using Next.js 16 Server Actions for progressive enhancement, React 19's useActionState for form state management, and three-layer spam protection (reCAPTCHA v3 + honeypot + rate limiting). The form collects name, photo, job title, company, and LinkedIn, uploads the image to Sanity's asset CDN, creates a pending member document, and displays confirmation.

Next.js 16 Server Actions provide progressive enhancement by default—forms work even with JavaScript disabled. React 19's useActionState hook simplifies form state management with built-in pending and error states. Sanity's client.assets.upload() API accepts browser File objects directly for seamless image uploads. Form validation uses Zod schemas shared between client (React Hook Form) and server (Server Action) for type-safe, consistent validation.

Critical patterns identified: Server Actions with FormData for progressive enhancement, useActionState for managing submission states, client.assets.upload() for Sanity image uploads, Zod + React Hook Form for client/server validation, WCAG-compliant required field indication (aria-required + visual markers), touch-friendly mobile inputs (44px minimum touch targets, 16-32px spacing), inline validation with immediate feedback, success confirmation with next-step guidance.

**Primary recommendation:** Use Next.js 16 native form with Server Action (progressive enhancement), React 19 useActionState for state management, React Hook Form + Zod for client validation, Zod-only for server validation, Sanity client.assets.upload() for image uploads, three-layer spam protection from Phase 1 utilities, WCAG 2.1 AA compliant markup, mobile-first responsive design with 44px touch targets.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Server Actions | 16+ | Form submission with progressive enhancement | Native Next.js feature; works without JS; automatic FormData handling |
| React 19 useActionState | 19.0+ | Form state management (pending, errors, data) | Official React 19 hook; replaces useFormState; built-in pending/error handling |
| Zod | 3.x | Schema validation (client + server) | TypeScript-first validation; shared schemas; type inference |
| React Hook Form | 7.x | Client-side form management | Minimal re-renders; excellent DX; pairs with Zod via @hookform/resolvers |
| @sanity/client | 7.x | Sanity API client with asset upload | Official client; client.assets.upload() accepts File objects |
| react-google-recaptcha-v3 | 1.11+ | reCAPTCHA v3 client integration | Already installed in Phase 1; invisible bot detection |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hookform/resolvers | 3.x | Zod + React Hook Form integration | Bridges Zod schemas with React Hook Form; zodResolver adapter |
| next/image | 16+ | Optimized image preview | Preview uploaded images before submission |
| Tailwind CSS | 4.x | Responsive form styling | Already configured; utility-first for mobile-responsive forms |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions | API Route + fetch | Server Actions provide progressive enhancement; API routes require client JS |
| React Hook Form | Formik, plain React state | RHF has better performance (fewer re-renders); established ecosystem |
| Zod | Yup, Joi | Zod is TypeScript-first with superior type inference; pairs well with tRPC/Next.js |
| useActionState | Manual useState + useTransition | useActionState is React 19 standard; built-in pending/error handling |

**Installation:**

```bash
# Form validation libraries
npm install zod react-hook-form @hookform/resolvers

# Already installed from Phase 1:
# - react-google-recaptcha-v3 (spam protection)
# - @sanity/client (Sanity API + asset upload)
# - next, react@19, @supabase/ssr (for optional user tracking)
```

## Architecture Patterns

### Recommended Project Structure

```
app/
├── (public)/
│   ├── join/                     # Member submission form
│   │   ├── page.tsx             # Form page with RecaptchaProvider wrapper
│   │   └── actions.ts           # Server Actions (submitMember)
│   └── join-confirmation/        # Success page after submission
│       └── page.tsx             # Confirmation message

lib/
├── validations/
│   └── member-submission.ts     # Zod schema (shared client/server)
├── sanity/
│   ├── client.ts                # Sanity client (read-only, useCdn: true)
│   └── write-client.ts          # NEW: Write client (useCdn: false, token: SANITY_WRITE_TOKEN)
└── spam-protection.ts           # Already exists from Phase 1

components/
├── RecaptchaProvider.tsx        # Already exists from Phase 1
└── forms/
    ├── MemberSubmissionForm.tsx # Client component with React Hook Form
    ├── FormField.tsx            # Reusable field wrapper with error display
    └── ImageUpload.tsx          # File input with preview and validation
```

### Pattern 1: Server Action with Progressive Enhancement

**What:** Native HTML form submits to Server Action using action prop. Works without JavaScript.

**When to use:** All forms requiring database writes. Essential for accessibility and progressive enhancement.

**Example:**

```typescript
// app/(public)/join/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeClient } from '@/lib/sanity/write-client';
import { memberSubmissionSchema } from '@/lib/validations/member-submission';
import { verifyRecaptcha, checkHoneypot, rateLimit } from '@/lib/spam-protection';

export async function submitMemberAction(prevState: any, formData: FormData) {
  // 1. Extract form data
  const rawData = {
    name: formData.get('name'),
    jobTitle: formData.get('jobTitle'),
    company: formData.get('company'),
    linkedIn: formData.get('linkedIn'),
    photo: formData.get('photo'), // File object
    recaptchaToken: formData.get('recaptchaToken'),
    _honey: formData.get('_honey'),
  };

  // 2. Spam protection (three layers)
  if (checkHoneypot(rawData)) {
    return { success: false, error: 'Invalid submission' };
  }

  const rateLimitResult = rateLimit('global', 10, 60000); // 10 per minute
  if (!rateLimitResult.allowed) {
    return { success: false, error: 'Too many submissions. Please try again later.' };
  }

  const recaptchaResult = await verifyRecaptcha(
    rawData.recaptchaToken as string,
    'member_submission'
  );
  if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
    return { success: false, error: 'Failed spam verification' };
  }

  // 3. Validate with Zod
  const validation = memberSubmissionSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  // 4. Upload image to Sanity
  const photoFile = data.photo as File;
  const imageAsset = await writeClient.assets.upload('image', photoFile, {
    filename: photoFile.name,
    contentType: photoFile.type,
  });

  // 5. Create member document with status: pending
  const member = await writeClient.create({
    _type: 'member',
    name: data.name,
    jobTitle: data.jobTitle,
    company: data.company || undefined,
    linkedIn: data.linkedIn || undefined,
    photo: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: imageAsset._id,
      },
    },
    status: 'pending', // Default from schema
    submittedAt: new Date().toISOString(),
  });

  // 6. Revalidate and redirect
  revalidatePath('/join');
  redirect('/join-confirmation');
}
```

**Source:** [Next.js Guides: Forms](https://nextjs.org/docs/app/guides/forms), [MakerKit: Next.js Server Actions Complete Guide](https://makerkit.dev/blog/tutorials/nextjs-server-actions)

### Pattern 2: useActionState for Form State Management

**What:** React 19 hook that manages action state (pending, error, data). Replaces useFormState.

**When to use:** All forms with Server Actions. Provides pending state for loading UI and error handling.

**Example:**

```typescript
// app/(public)/join/page.tsx
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitMemberAction } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Submitting...' : 'Submit Application'}
    </button>
  );
}

export default function JoinPage() {
  const [state, formAction, isPending] = useActionState(submitMemberAction, null);

  return (
    <form action={formAction}>
      {/* Form fields */}

      {state?.error && (
        <div role="alert" className="error-message">
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
```

**Source:** [React: useActionState](https://react.dev/reference/react/useActionState), [Codefinity: React useActionState Hook](https://codefinity.com/blog/React-useActionState-Hook)

### Pattern 3: Zod + React Hook Form (Client Validation)

**What:** Combine React Hook Form for form state with Zod for validation. Same schema used on server.

**When to use:** Client-side validation for immediate feedback. Server must re-validate (never trust client).

**Example:**

```typescript
// lib/validations/member-submission.ts
import { z } from 'zod';

export const memberSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  jobTitle: z.string().min(2, 'Job title is required').max(100),
  company: z.string().max(100).optional(),
  linkedIn: z
    .string()
    .url('Must be a valid URL')
    .regex(/linkedin\.com/, 'Must be a LinkedIn URL')
    .optional()
    .or(z.literal('')),
  photo: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Must be JPEG, PNG, or WebP'
    ),
  recaptchaToken: z.string().min(1, 'reCAPTCHA verification required'),
  _honey: z.string().optional(), // Honeypot field (should be empty)
});

export type MemberSubmissionData = z.infer<typeof memberSubmissionSchema>;
```

```typescript
// components/forms/MemberSubmissionForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { memberSubmissionSchema, type MemberSubmissionData } from '@/lib/validations/member-submission';

export function MemberSubmissionForm({ action }: { action: any }) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberSubmissionData>({
    resolver: zodResolver(memberSubmissionSchema),
  });

  const onSubmit = async (data: MemberSubmissionData) => {
    if (!executeRecaptcha) return;

    const token = await executeRecaptcha('member_submission');

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('jobTitle', data.jobTitle);
    formData.append('company', data.company || '');
    formData.append('linkedIn', data.linkedIn || '');
    formData.append('photo', data.photo);
    formData.append('recaptchaToken', token);
    formData.append('_honey', ''); // Honeypot (should remain empty)

    action(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with register() and error display */}
    </form>
  );
}
```

**Source:** [Medium: React Hook Form + Zod with Next.js Server Actions](https://medium.com/@ctrlaltmonique/how-to-use-react-hook-form-zod-with-next-js-server-actions-437aaca3d72d), [PracticalDev: Zod React Hook Form Complete Guide 2026](https://practicaldev.online/blog/reactjs/react-hook-form-zod-validation-guide)

### Pattern 4: Sanity Asset Upload from Browser

**What:** Use client.assets.upload() to upload File objects directly to Sanity's asset CDN.

**When to use:** All user-submitted images. Returns asset document with _id for referencing in content.

**Example:**

```typescript
// lib/sanity/write-client.ts
import { createClient } from '@sanity/client';

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false, // CRITICAL: Write operations must not use CDN
  token: process.env.SANITY_WRITE_TOKEN!, // Server-only token with Editor role
});

// Usage in Server Action:
const photoFile = formData.get('photo') as File;
const imageAsset = await writeClient.assets.upload('image', photoFile, {
  filename: photoFile.name,
  contentType: photoFile.type,
});

// imageAsset contains:
// - _id: Asset ID for referencing
// - url: CDN URL
// - metadata: dimensions, format, etc.
```

**IMPORTANT:** Sanity write client requires:
1. `useCdn: false` (writes don't go through CDN)
2. `token` with Editor or Admin role (NOT the public read token)
3. Server-only usage (never expose write token to client)

**Source:** [Sanity: Assets - Upload, Download & Delete](https://www.sanity.io/docs/assets), [Code Concisely: Uploading Files to Sanity via API](https://www.codeconcisely.com/posts/sanity-api-file-upload/)

### Pattern 5: WCAG-Compliant Required Fields

**What:** Indicate required fields using aria-required, visual markers, and programmatic labels.

**When to use:** All forms. WCAG 2.1 Level AA compliance requires both visual and programmatic indication.

**Example:**

```typescript
// components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, name, required, error, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
        {required && (
          <>
            {' '}
            <abbr title="required" aria-label="required" className="text-red-600">
              *
            </abbr>
          </>
        )}
      </label>

      {children}

      {error && (
        <p id={`${name}-error`} role="alert" className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}

// Usage:
<FormField label="Full Name" name="name" required error={errors.name?.message}>
  <input
    id="name"
    {...register('name')}
    aria-required="true"
    aria-invalid={!!errors.name}
    aria-describedby={errors.name ? 'name-error' : undefined}
    className="form-input"
  />
</FormField>
```

**Key WCAG requirements:**
- `aria-required="true"` for screen readers
- Visual indicator (asterisk) for sighted users
- `aria-invalid` when field has error
- `aria-describedby` linking to error message
- `role="alert"` for error messages (announces to screen readers)

**Source:** [W3C WAI: Form Instructions](https://www.w3.org/WAI/tutorials/forms/instructions/), [Deque: Anatomy of Accessible Forms - Required Fields](https://www.deque.com/blog/anatomy-of-accessible-forms-required-form-fields/)

### Pattern 6: Touch-Friendly Mobile Forms

**What:** Design forms with 44px minimum touch targets, 16-32px spacing, vertical stacking.

**When to use:** All forms accessed on mobile devices (majority of traffic in 2026).

**Example:**

```typescript
// Tailwind CSS classes for mobile-responsive form
<form className="max-w-lg mx-auto px-4 py-6 space-y-6">
  {/* Labels above inputs (not beside or inside) */}
  <div className="space-y-2">
    <label className="block text-base font-medium">
      Full Name <span className="text-red-600">*</span>
    </label>
    <input
      type="text"
      className="w-full h-12 px-4 text-base border-2 rounded-lg
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 touch-manipulation" // Prevents zoom on iOS
    />
  </div>

  {/* 24px spacing between fields */}
  <div className="space-y-2">
    <label className="block text-base font-medium">
      Job Title <span className="text-red-600">*</span>
    </label>
    <input
      type="text"
      className="w-full h-12 px-4 text-base border-2 rounded-lg"
    />
  </div>

  {/* Large submit button with 48px minimum height */}
  <button
    type="submit"
    className="w-full h-12 sm:h-14 bg-blue-600 text-white text-lg font-semibold
               rounded-lg hover:bg-blue-700 active:bg-blue-800
               disabled:bg-gray-300 disabled:cursor-not-allowed
               transition-colors"
  >
    Submit Application
  </button>
</form>
```

**Mobile design rules:**
- Minimum 44px (h-12 in Tailwind) touch targets (Apple HIG guideline)
- 16-32px vertical spacing between fields
- Labels ABOVE inputs (not inside placeholders)
- Full-width inputs on mobile
- Font size 16px minimum (prevents iOS zoom on focus)
- `touch-manipulation` CSS to disable double-tap zoom
- Input type attributes for correct mobile keyboard (email, url, tel)

**Source:** [Forms on Fire: Mobile Form Design Best Practices](https://www.formsonfire.com/blog/mobile-form-design), [Medium: Designing Mobile-Friendly Forms](https://medium.com/@Alekseidesign/designing-mobile-friendly-forms-a-ui-ux-guide-483fe477f3f3)

### Pattern 7: Inline Validation with Immediate Feedback

**What:** Validate fields as user types or on blur. Show success/error state immediately.

**When to use:** All interactive forms. Reduces form abandonment and frustration.

**Example:**

```typescript
// React Hook Form provides automatic validation on blur/change
const { register, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Validate on blur (less aggressive than onChange)
});

// Visual feedback with Tailwind
<input
  {...register('email')}
  className={`
    form-input
    ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
    ${!errors.email && watchedEmail ? 'border-green-500' : ''}
  `}
  aria-invalid={!!errors.email}
/>

{errors.email && (
  <p className="mt-1 text-sm text-red-600" role="alert">
    {errors.email.message}
  </p>
)}
```

**Validation timing strategies:**
- `mode: 'onBlur'` - Validate when field loses focus (recommended, less aggressive)
- `mode: 'onChange'` - Validate on every keystroke (good for complex fields like passwords)
- `mode: 'onSubmit'` - Validate only on submit (progressive enhancement fallback)

**Source:** [Smashing Magazine: Guide to Accessible Form Validation](https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/)

### Pattern 8: Success Confirmation with Next Steps

**What:** After successful submission, show confirmation with clear next steps.

**When to use:** All forms. Reassures users and guides them forward.

**Example:**

```typescript
// app/(public)/join-confirmation/page.tsx
export default function JoinConfirmationPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      {/* Visual success indicator */}
      <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Clear confirmation message */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Application Submitted Successfully!
      </h1>

      <p className="text-lg text-gray-700 mb-6">
        Thank you for applying to join the Checkmate & Connect member directory.
      </p>

      {/* Explain what happens next */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
        <h2 className="font-semibold text-blue-900 mb-2">What happens next?</h2>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">1.</span>
            <span>Our team will review your submission within 2-3 business days</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2.</span>
            <span>Once approved, your profile will appear in the member directory</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3.</span>
            <span>You'll be able to connect with other members at our weekly meetups</span>
          </li>
        </ul>
      </div>

      {/* Clear call-to-action */}
      <a href="/" className="inline-block btn-primary">
        Return to Homepage
      </a>
    </div>
  );
}
```

**Success message best practices:**
- Visual confirmation (checkmark icon, green color)
- Clear confirmation of what was accomplished
- Explain next steps (when to expect response, what happens)
- Provide clear path forward (CTA button)
- Avoid leaving users "hanging" at success state

**Source:** [Pencil & Paper: Success Message UX Best Practices](https://www.pencilandpaper.io/articles/success-ux), [Design Systems Collective: Success States & Confirmation Patterns](https://www.designsystemscollective.com/designing-success-part-2-dos-don-ts-and-use-cases-of-confirmation-patterns-6e760ccd1708)

### Anti-Patterns to Avoid

- **Custom invocation with startTransition**: Disables progressive enhancement; form won't work without JS
- **Labels inside input placeholders**: Disappears when user types; fails accessibility; not a label
- **Client-only validation**: Always validate on server; client validation is UX enhancement, not security
- **Exposing SANITY_WRITE_TOKEN to client**: Write token must be server-only; use API routes or Server Actions
- **Using read client for writes**: `useCdn: true` client caches responses; writes require `useCdn: false`
- **Color-only error indicators**: WCAG failure; use text + icon + color for accessibility
- **Tiny touch targets on mobile**: <44px touch targets cause frustration and errors
- **No loading state during submission**: Users will double-submit; always show pending state
- **Generic error messages**: "Something went wrong" is unhelpful; show specific, actionable errors
- **Forgetting honeypot and rate limiting**: reCAPTCHA v3 alone is insufficient; use three-layer protection

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom useState tracking | React Hook Form + useActionState | Handles validation, errors, pending states, re-renders; 1000s of edge cases |
| Schema validation | Manual if/else validation | Zod | Type-safe, composable, reusable, client/server shared schemas |
| Image upload to Sanity | Custom multipart handling + fetch | client.assets.upload() | Official API, handles File objects, returns asset document, manages CDN |
| Spam protection | Custom bot detection | reCAPTCHA v3 + honeypot + rate limiting | ML-based risk scoring, honeypot catches simple bots, rate limiting prevents abuse |
| Required field indication | Simple asterisk | WCAG-compliant pattern with aria-required | Screen reader support, semantic HTML, compliance with accessibility laws |
| Mobile-responsive forms | Custom media queries | Mobile-first Tailwind utilities | Touch target sizing, keyboard optimization, tested patterns |
| Form validation feedback | Custom error display | React Hook Form error handling | Automatic field-level errors, aria-invalid, accessible error announcements |
| Progressive enhancement | Custom fetch wrapper | Server Actions | Built-in FormData handling, works without JS, automatic CSRF protection |

**Key insight:** Form handling in 2026 is about composing proven patterns rather than building from scratch. React 19 + Next.js 16 + React Hook Form + Zod + Sanity SDK provide 95% of form functionality. Focus on UX, accessibility, and spam protection—not reimplementing form primitives.

## Common Pitfalls

### Pitfall 1: Breaking Progressive Enhancement

**What goes wrong:** Form requires JavaScript to submit. Fails for users with JS disabled, slow connections, or accessibility tools.

**Why it happens:** Using `startTransition` for custom action invocation, or fetch API instead of native form submission.

**How to avoid:**
- Use native `<form action={serverAction}>` pattern
- Avoid `startTransition` wrapper around form actions
- Test with JS disabled in DevTools
- Let Server Actions handle FormData natively

**Warning signs:**
- Form does nothing when JS is disabled
- Using onClick on button instead of form onSubmit
- Manually calling fetch() instead of form action

**Source:** [Next.js: Getting Started - Updating Data](https://nextjs.org/docs/app/getting-started/updating-data)

### Pitfall 2: Client-Only Validation

**What goes wrong:** Validation only runs on client. Malicious users bypass validation by disabling JS or using API directly.

**Why it happens:** Trusting client-side React Hook Form validation without server-side Zod validation.

**How to avoid:**
- ALWAYS validate on server with Zod in Server Action
- Client validation is UX enhancement, not security
- Use same Zod schema on client and server
- Never trust FormData without validation

**Warning signs:**
- Server Action doesn't call schema.safeParse()
- Assuming data is valid because it passed client validation
- Invalid data creating documents in Sanity

### Pitfall 3: Exposing Write Token to Client

**What goes wrong:** SANITY_WRITE_TOKEN exposed to client bundle. Attackers can write/delete arbitrary content.

**Why it happens:** Using NEXT_PUBLIC_ prefix, or importing write client in Client Component.

**How to avoid:**
- NEVER use NEXT_PUBLIC_ for write token
- Create separate write-client.ts for server-only use
- Only import write client in Server Actions or API routes
- Audit built bundle: search for token in .next directory

**Warning signs:**
- NEXT_PUBLIC_SANITY_WRITE_TOKEN in .env
- Importing write client in 'use client' component
- Seeing write token in browser DevTools Network tab

### Pitfall 4: File Size Not Validated

**What goes wrong:** Users upload 50MB images. Server runs out of memory or times out. Poor UX.

**Why it happens:** Forgetting to validate File size before upload.

**How to avoid:**
- Validate file size with Zod refinement (5MB max recommended)
- Validate file type (image/jpeg, image/png, image/webp only)
- Show preview before upload so user knows what they're submitting
- Configure Next.js serverActions.bodySizeLimit if needed

**Warning signs:**
- Upload takes minutes
- Server timeouts on large files
- Out of memory errors in production

**Next.js config for larger body sizes:**
```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Default is 1mb
    },
  },
};
```

**Source:** [Medium: Build Custom File Upload in Next.js](https://medium.com/@willchesson/build-a-custom-file-upload-component-in-next-js-managing-file-sizes-formats-and-upload-limits-602e6793d0a1)

### Pitfall 5: No Pending State During Submission

**What goes wrong:** Users don't know form is submitting. Click submit button multiple times. Multiple submissions created.

**Why it happens:** Not using useActionState or useFormStatus to show pending state.

**How to avoid:**
- Use useActionState's isPending for loading indicator
- Use useFormStatus for button disabled state
- Show spinner or "Submitting..." text
- Disable submit button while pending

**Warning signs:**
- Users report "nothing happened" after clicking submit
- Duplicate submissions in database
- No visual feedback during 2-3 second upload

### Pitfall 6: Inaccessible Error Messages

**What goes wrong:** Screen readers don't announce form errors. Errors use color only (WCAG failure).

**Why it happens:** Missing role="alert", aria-invalid, aria-describedby attributes.

**How to avoid:**
- Use role="alert" on error message elements
- Add aria-invalid="true" to fields with errors
- Link errors with aria-describedby
- Use icon + text + color (not color alone)
- Ensure sufficient color contrast (4.5:1 minimum)

**WCAG 2.1 requirements:**
- Level A: Error identification programmatically associated with fields
- Level AA: Color is not the only visual means of conveying information
- Level AAA: Suggestions provided when input error detected

**Source:** [Smashing Magazine: Accessible Form Validation](https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/)

### Pitfall 7: Mobile Input Zoom on Focus

**What goes wrong:** iOS Safari zooms in when user focuses input. Disorienting UX.

**Why it happens:** Font size less than 16px triggers iOS zoom behavior.

**How to avoid:**
- Use minimum 16px font size on all form inputs
- Add `touch-manipulation` CSS to inputs
- Test on actual iOS device (not just simulator)

```css
input, textarea, select {
  font-size: 16px; /* Minimum to prevent iOS zoom */
  touch-action: manipulation; /* Disables double-tap zoom */
}
```

**Source:** [Forms on Fire: Mobile Form Design Best Practices](https://www.formsonfire.com/blog/mobile-form-design)

### Pitfall 8: LinkedIn URL Regex Too Strict

**What goes wrong:** Valid LinkedIn URLs rejected by validation. Users frustrated.

**Why it happens:** Regex matches exact pattern but LinkedIn has many URL formats (profile, public profile, vanity URL, etc.).

**How to avoid:**
- Match linkedin.com domain, not exact URL structure
- Allow http and https
- Allow optional trailing slash
- Test with real LinkedIn URLs (profile, company, etc.)

```typescript
// Too strict (BAD):
z.string().regex(/^https:\/\/www\.linkedin\.com\/in\/[a-z0-9-]+\/$/)

// Flexible (GOOD):
z.string().url().regex(/linkedin\.com/, 'Must be a LinkedIn URL')
```

## Code Examples

Verified patterns from official sources and 2026 best practices:

### Complete Server Action with Spam Protection

```typescript
// app/(public)/join/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { writeClient } from '@/lib/sanity/write-client';
import { memberSubmissionSchema } from '@/lib/validations/member-submission';
import { verifyRecaptcha, checkHoneypot, rateLimit } from '@/lib/spam-protection';

export async function submitMemberAction(prevState: any, formData: FormData) {
  // 1. Extract and structure form data
  const rawData = {
    name: formData.get('name') as string,
    jobTitle: formData.get('jobTitle') as string,
    company: formData.get('company') as string,
    linkedIn: formData.get('linkedIn') as string,
    photo: formData.get('photo') as File,
    recaptchaToken: formData.get('recaptchaToken') as string,
    _honey: formData.get('_honey') as string,
  };

  // 2. Three-layer spam protection

  // Layer 1: Honeypot (catches simple bots)
  if (checkHoneypot(rawData)) {
    console.warn('Honeypot triggered');
    return { success: false, error: 'Invalid submission. Please try again.' };
  }

  // Layer 2: Rate limiting (prevents abuse)
  const rateLimitResult = rateLimit('member_submission_global', 10, 60000);
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: 'Too many submissions. Please wait a moment and try again.',
    };
  }

  // Layer 3: reCAPTCHA v3 (ML-based bot detection)
  const recaptchaResult = await verifyRecaptcha(
    rawData.recaptchaToken,
    'member_submission'
  );
  if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
    console.warn('reCAPTCHA failed:', recaptchaResult);
    return {
      success: false,
      error: 'Failed spam verification. Please refresh and try again.',
    };
  }

  // 3. Validate with Zod schema (server-side validation)
  const validation = memberSubmissionSchema.safeParse(rawData);
  if (!validation.success) {
    console.error('Validation failed:', validation.error);
    return {
      success: false,
      error: 'Please check your form for errors.',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  try {
    // 4. Upload image to Sanity CDN
    const photoFile = data.photo;
    const imageAsset = await writeClient.assets.upload('image', photoFile, {
      filename: photoFile.name,
      contentType: photoFile.type,
    });

    // 5. Create member document with status: pending
    const member = await writeClient.create({
      _type: 'member',
      name: data.name,
      jobTitle: data.jobTitle,
      company: data.company || undefined,
      linkedIn: data.linkedIn || undefined,
      photo: {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
      },
      status: 'pending', // Default from schema
      submittedAt: new Date().toISOString(),
    });

    console.log('Member created:', member._id);

    // 6. Revalidate cache and redirect to confirmation
    revalidatePath('/join');
    redirect('/join-confirmation');
  } catch (error) {
    console.error('Failed to create member:', error);
    return {
      success: false,
      error: 'Failed to submit application. Please try again.',
    };
  }
}
```

**Source:** [MakerKit: Next.js Server Actions Complete Guide](https://makerkit.dev/blog/tutorials/nextjs-server-actions)

### Form Page with RecaptchaProvider and useActionState

```typescript
// app/(public)/join/page.tsx
import { RecaptchaProvider } from '@/components/RecaptchaProvider';
import { MemberSubmissionForm } from '@/components/forms/MemberSubmissionForm';
import { submitMemberAction } from './actions';

export const metadata = {
  title: 'Join the Directory',
  description: 'Apply to join the Checkmate & Connect member directory',
};

export default function JoinPage() {
  return (
    <RecaptchaProvider>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Join Our Member Directory
        </h1>

        <p className="text-lg text-gray-700 mb-8">
          Complete this form to apply for inclusion in the Checkmate & Connect
          member directory. All submissions are reviewed by our team.
        </p>

        <MemberSubmissionForm action={submitMemberAction} />
      </div>
    </RecaptchaProvider>
  );
}
```

### Complete Form Component with React Hook Form + Zod

```typescript
// components/forms/MemberSubmissionForm.tsx
'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { memberSubmissionSchema, type MemberSubmissionData } from '@/lib/validations/member-submission';
import { FormField } from './FormField';
import { ImageUpload } from './ImageUpload';

export function MemberSubmissionForm({ action }: { action: any }) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [state, formAction] = useActionState(action, null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<MemberSubmissionData>({
    resolver: zodResolver(memberSubmissionSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: MemberSubmissionData) => {
    if (!executeRecaptcha) {
      console.error('reCAPTCHA not loaded');
      return;
    }

    // Get reCAPTCHA token
    const token = await executeRecaptcha('member_submission');

    // Build FormData
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('jobTitle', data.jobTitle);
    formData.append('company', data.company || '');
    formData.append('linkedIn', data.linkedIn || '');
    formData.append('photo', data.photo);
    formData.append('recaptchaToken', token);
    formData.append('_honey', ''); // Honeypot (should remain empty)

    // Submit via Server Action
    formAction(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Global error message */}
      {state?.error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
        >
          {state.error}
        </div>
      )}

      {/* Name field */}
      <FormField
        label="Full Name"
        name="name"
        required
        error={errors.name?.message}
      >
        <input
          id="name"
          type="text"
          {...register('name')}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className="w-full h-12 px-4 text-base border-2 border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     touch-manipulation"
        />
      </FormField>

      {/* Job Title field */}
      <FormField
        label="Job Title"
        name="jobTitle"
        required
        error={errors.jobTitle?.message}
      >
        <input
          id="jobTitle"
          type="text"
          {...register('jobTitle')}
          aria-required="true"
          aria-invalid={!!errors.jobTitle}
          aria-describedby={errors.jobTitle ? 'jobTitle-error' : undefined}
          placeholder="e.g., Software Engineer, Founder, Designer"
          className="w-full h-12 px-4 text-base border-2 border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     touch-manipulation"
        />
      </FormField>

      {/* Company field (optional) */}
      <FormField
        label="Company"
        name="company"
        error={errors.company?.message}
      >
        <input
          id="company"
          type="text"
          {...register('company')}
          aria-invalid={!!errors.company}
          placeholder="e.g., Acme Corp (optional)"
          className="w-full h-12 px-4 text-base border-2 border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     touch-manipulation"
        />
      </FormField>

      {/* LinkedIn field (optional) */}
      <FormField
        label="LinkedIn URL"
        name="linkedIn"
        error={errors.linkedIn?.message}
      >
        <input
          id="linkedIn"
          type="url"
          {...register('linkedIn')}
          inputMode="url"
          aria-invalid={!!errors.linkedIn}
          placeholder="https://linkedin.com/in/yourprofile (optional)"
          className="w-full h-12 px-4 text-base border-2 border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     touch-manipulation"
        />
      </FormField>

      {/* Photo upload (required) */}
      <ImageUpload
        label="Profile Photo"
        name="photo"
        required
        error={errors.photo?.message}
        onChange={(file) => setValue('photo', file)}
        value={watch('photo')}
      />

      {/* Honeypot field (hidden from users, bots will fill it) */}
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        className="sr-only"
        aria-hidden="true"
      />

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 sm:h-14 bg-blue-600 text-white text-lg font-semibold
                   rounded-lg hover:bg-blue-700 active:bg-blue-800
                   disabled:bg-gray-300 disabled:cursor-not-allowed
                   transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </button>

      {/* Privacy notice */}
      <p className="text-sm text-gray-600">
        By submitting this form, you agree to have your profile reviewed by our
        team. Approved profiles will be publicly visible in the member directory.
      </p>
    </form>
  );
}
```

### Image Upload Component with Preview

```typescript
// components/forms/ImageUpload.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  onChange: (file: File) => void;
  value?: File;
}

export function ImageUpload({
  label,
  name,
  required,
  error,
  onChange,
  value,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Pass file to parent form
    onChange(file);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-base font-medium">
        {label}
        {required && (
          <>
            {' '}
            <abbr title="required" aria-label="required" className="text-red-600">
              *
            </abbr>
          </>
        )}
      </label>

      {/* File input */}
      <input
        id={name}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className="block w-full text-base text-gray-700
                   file:mr-4 file:py-3 file:px-4
                   file:rounded-lg file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100
                   touch-manipulation"
      />

      {/* Preview */}
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={previewUrl}
              alt="Profile photo preview"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Format/size guidance */}
      <p className="text-sm text-gray-600">
        JPEG, PNG, or WebP. Maximum 5MB.
      </p>

      {/* Error message */}
      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| useFormState | useActionState | React 19 (Dec 2024) | Renamed for clarity; same functionality with better semantics |
| API routes for forms | Server Actions | Next.js 13+ (stable in 16) | Progressive enhancement, FormData handling, CSRF protection built-in |
| Formik | React Hook Form | 2022-2024 | Better performance, smaller bundle, better DX |
| Manual multipart parsing | FormData native support | Next.js 13+ | Server Actions handle multipart automatically |
| Client-side reCAPTCHA v2 | reCAPTCHA v3 | 2023-2026 | Invisible to users, ML-based scoring, better UX |
| Supabase Storage for images | Sanity Asset CDN | Project-specific | Sanity provides optimization, hotspot, CDN out of box |

**Deprecated/outdated:**

- **useFormState**: Renamed to useActionState in React 19
- **fetch() for form submission**: Use Server Actions for progressive enhancement
- **Formik**: React Hook Form is now ecosystem standard for complex forms
- **reCAPTCHA v2 checkbox**: v3 is invisible and provides better UX
- **Manual FormData parsing**: Next.js Server Actions handle it automatically

## Open Questions

1. **Rate Limiting Scale**
   - What we know: In-memory rate limiting from Phase 1 works for MVP; resets on server restart
   - What's unclear: At what traffic level does Upstash Redis become necessary
   - Recommendation: Start with in-memory; monitor submission volume; migrate to Upstash if >1000 submissions/hour

2. **Image Optimization Before Upload**
   - What we know: Sanity CDN optimizes on-the-fly; upload high-res originals
   - What's unclear: Should client-side compress 50MB DSLR photos before upload to reduce bandwidth?
   - Recommendation: Add client-side compression only if user testing shows upload time issues

3. **Slug Generation for Members**
   - What we know: Sanity schema has slug field sourced from name
   - What's unclear: Should Server Action generate slug or let Sanity Studio handle it?
   - Recommendation: Server Action should generate slug with `slugify(name)` for consistency

4. **Duplicate Submission Prevention**
   - What we know: Rate limiting prevents rapid resubmission
   - What's unclear: Should we check for existing pending submissions by email/name?
   - Recommendation: Add duplicate check by name (case-insensitive) to prevent accidental resubmissions

5. **Email Confirmation to Submitter**
   - What we know: Success criteria says "visitor receives confirmation" (on-screen)
   - What's unclear: Should we also send email confirmation?
   - Recommendation: Phase 3 does on-screen confirmation only; email notifications are Phase 5 enhancement

## Sources

### Primary (HIGH confidence)

- [Next.js: Guides - Forms](https://nextjs.org/docs/app/guides/forms) - Official Next.js form handling patterns
- [Next.js: Getting Started - Updating Data](https://nextjs.org/docs/app/getting-started/updating-data) - Server Actions progressive enhancement
- [React: useActionState](https://react.dev/reference/react/useActionState) - Official React 19 documentation
- [React v19 Release](https://react.dev/blog/2024/12/05/react-19) - React 19 features and changes
- [Sanity: Assets API](https://www.sanity.io/docs/http-api-assets) - Official asset upload documentation
- [Sanity: Assets - Upload, Download & Delete](https://www.sanity.io/docs/assets) - Asset management guide
- [W3C WAI: Form Instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) - WCAG form accessibility guidelines
- [W3C WAI: Labeling Controls](https://www.w3.org/WAI/tutorials/forms/labels/) - Accessible form labels

### Secondary (MEDIUM confidence)

- [MakerKit: Next.js Server Actions Complete Guide (2026)](https://makerkit.dev/blog/tutorials/nextjs-server-actions) - Comprehensive Server Actions tutorial
- [Strapi: Next.js 15 File Upload with Server Actions](https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions) - File upload patterns (verified Jan 2026)
- [Code Concisely: Uploading Files to Sanity via API](https://www.codeconcisely.com/posts/sanity-api-file-upload/) - Sanity asset upload guide
- [Medium: React Hook Form + Zod with Next.js Server Actions](https://medium.com/@ctrlaltmonique/how-to-use-react-hook-form-zod-with-next-js-server-actions-437aaca3d72d) - Validation integration patterns
- [PracticalDev: Zod React Hook Form Complete Guide 2026](https://practicaldev.online/blog/reactjs/react-hook-form-zod-validation-guide) - Form validation best practices
- [Deque: Anatomy of Accessible Forms - Required Fields](https://www.deque.com/blog/anatomy-of-accessible-forms-required-form-fields/) - Accessibility implementation
- [Smashing Magazine: Guide to Accessible Form Validation](https://www.smashingmagazine.com/2023/02/guide-accessible-form-validation/) - WCAG-compliant error handling
- [Forms on Fire: Mobile Form Design Best Practices](https://www.formsonfire.com/blog/mobile-form-design) - Touch-friendly form patterns
- [Medium: Designing Mobile-Friendly Forms](https://medium.com/@Alekseidesign/designing-mobile-friendly-forms-a-ui-ux-guide-483fe477f3f3) - Mobile UX guidelines
- [Pencil & Paper: Success Message UX Best Practices](https://www.pencilandpaper.io/articles/success-ux) - Confirmation patterns
- [Design Systems Collective: Success States & Confirmation Patterns](https://www.designsystemscollective.com/designing-success-part-2-dos-don-ts-and-use-cases-of-confirmation-patterns-6e760ccd1708) - Success state design

### Tertiary (LOW confidence)

- Various GitHub discussions on Next.js file upload size limits - directional insights only
- Medium articles on form validation patterns - verify against official docs

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH - Next.js 16 Server Actions, React 19 useActionState, Zod, React Hook Form all verified from official sources
- **Architecture patterns:** HIGH - Patterns extracted from official Next.js 16 docs, React 19 docs, and verified tutorials from Jan-Feb 2026
- **Sanity asset upload:** HIGH - Official Sanity documentation and verified implementation guides
- **Accessibility:** HIGH - WCAG 2.1 guidelines from W3C WAI (authoritative source)
- **Mobile responsiveness:** MEDIUM-HIGH - Best practices from multiple sources cross-verified
- **Spam protection:** HIGH - Already implemented in Phase 1; integration patterns clear
- **Progressive enhancement:** HIGH - Official Next.js documentation confirms Server Actions support by default

**Research date:** 2026-02-15
**Valid until:** ~2026-03-15 (30 days for stable ecosystem; Next.js 16 released Oct 2025, React 19 released Dec 2024, both stable)

**Research notes:**

This phase research covered 7 distinct domains (Server Actions, form validation, file upload, Sanity asset management, accessibility, mobile UX, spam protection). High confidence in Server Actions and React 19 patterns due to official documentation. Sanity asset upload API well-documented and verified. WCAG compliance patterns are stable and authoritative. Mobile UX best practices are well-established across sources.

Critical finding: Progressive enhancement is built into Next.js 16 Server Actions by default—forms work without JavaScript. This is a major advantage over API route + fetch pattern. React 19's useActionState significantly simplifies form state management compared to manual useState tracking.

Primary uncertainty is around optional enhancements (client-side image compression, duplicate detection, email confirmations) which can be addressed during planning based on MVP scope.
