'use client';

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
  });

  const onSubmit = (data: PresenceData) => {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('role', data.role);
    formData.append('company', data.company);
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
