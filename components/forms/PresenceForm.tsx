'use client';

import Link from 'next/link';
import { useActionState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { presenceSchema, type PresenceData } from '@/lib/validations/presence';
import {
  submitPresenceAction,
  type PresenceState,
} from '@/app/(public)/presence/actions';
import { Icon } from '@/components/ui/Icon';
import FormField, { fieldClass } from './FormField';

export default function PresenceForm() {
  const [state, formAction, isPending] = useActionState<PresenceState, FormData>(
    submitPresenceAction,
    null
  );
  const [isTransitioning, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PresenceData>({
    resolver: zodResolver(presenceSchema),
    mode: 'onBlur',
    defaultValues: { agreedToTerms: false },
  });

  const onSubmit = (data: PresenceData) => {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('role', data.role);
    formData.append('company', data.company);
    formData.append('agreedToTerms', String(data.agreedToTerms));
    formData.append('_honey', data._honey || '');

    startTransition(() => {
      formAction(formData);
    });
  };

  // No per-field messages: an empty field just isn't submitted, and
  // react-hook-form moves focus to it.
  const busy = isPending || isTransitioning;

  // Same as feedback: replace the form in place, no navigation to fail on a
  // phone in a queue.
  if (state?.ok) {
    return (
      <div role="status" className="py-6 text-center">
        <Icon
          name="check-circle"
          size={44}
          className="mx-auto text-positive"
          title="Checked in"
        />
        <h2 className="mt-6 font-display text-[clamp(26px,4vw,34px)] font-bold tracking-[-0.02em]">
          You&apos;re in.
        </h2>
        <p className="mt-3 text-body text-secondary">
          Thanks for coming. Enjoy the evening.
        </p>
      </div>
    );
  }

  return (
    <div>
      {state && !state.ok ? (
        <div
          role="alert"
          className="mb-8 rounded-input border border-negative/40 bg-negative/10 p-4 text-caption text-negative"
        >
          {state.error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
        <FormField label="Full name" name="fullName" required>
          <input
            type="text"
            id="fullName"
            {...register('fullName')}
            className={fieldClass}
            autoComplete="name"
            aria-invalid={errors.fullName ? true : undefined}
          />
        </FormField>

        <FormField label="Role" name="role" required>
          <input
            type="text"
            id="role"
            {...register('role')}
            className={fieldClass}
            autoComplete="organization-title"
            aria-invalid={errors.role ? true : undefined}
          />
        </FormField>

        <FormField label="Company" name="company" required>
          <input
            type="text"
            id="company"
            {...register('company')}
            className={fieldClass}
            autoComplete="organization"
            aria-invalid={errors.company ? true : undefined}
          />
        </FormField>

        {/* The terms open in a new tab so a half-filled form survives the read. */}
        <div>
          <label
            htmlFor="agreedToTerms"
            className="flex cursor-pointer touch-manipulation items-start gap-3.5"
          >
            <span className="relative mt-0.5 flex h-6 w-6 shrink-0">
              <input
                type="checkbox"
                id="agreedToTerms"
                {...register('agreedToTerms')}
                aria-invalid={errors.agreedToTerms ? true : undefined}
                aria-describedby={errors.agreedToTerms ? 'agreedToTerms-error' : undefined}
                className="peer h-6 w-6 cursor-pointer appearance-none rounded-badge border border-line bg-raised transition-colors checked:border-lime checked:bg-lime aria-[invalid=true]:border-negative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              />
              <Icon
                name="check"
                size={16}
                className="pointer-events-none absolute left-1 top-1 text-canvas opacity-0 peer-checked:opacity-100"
              />
            </span>
            <span className="text-caption leading-[22px] text-secondary">
              I agree to the{' '}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink underline underline-offset-4 transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                Terms &amp; Conditions
              </Link>
              <abbr title="required" aria-label="required" className="ml-1 text-lime no-underline">
                *
              </abbr>
            </span>
          </label>
          {errors.agreedToTerms ? (
            <p id="agreedToTerms-error" role="alert" className="mt-2 text-micro text-negative">
              {errors.agreedToTerms.message}
            </p>
          ) : null}
        </div>

        {/* Honeypot */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="_honey">Leave this field empty</label>
          <input
            type="text"
            id="_honey"
            {...register('_honey')}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-12 w-full touch-manipulation items-center justify-center rounded-pill bg-lime px-7 text-ui font-semibold text-canvas transition-colors hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Checking in...' : 'Confirm my presence'}
        </button>
      </form>
    </div>
  );
}
