'use client';

import { useActionState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  eventFeedbackSchema,
  type EventFeedbackData,
} from '@/lib/validations/event-feedback';
import {
  submitFeedbackAction,
  type FeedbackState,
} from '@/app/(public)/feedback/actions';
import { Icon, type IconName } from '@/components/ui/Icon';
import FormField, { fieldClass, textareaClass } from './FormField';

/** Label text with its signal icon. Green keep, red change — the only two
 *  colours on the page besides the lime button. */
function SignalLabel({
  icon,
  tone,
  children,
}: {
  icon: IconName;
  tone: 'positive' | 'negative';
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon
        name={icon}
        size={18}
        className={tone === 'positive' ? 'text-positive' : 'text-negative'}
      />
      {children}
    </span>
  );
}

export default function EventFeedbackForm({
  eventDate,
}: {
  /** ISO date of the session, from the DDMMYY in the URL. */
  eventDate: string;
}) {
  const [state, formAction, isPending] = useActionState<FeedbackState, FormData>(
    submitFeedbackAction,
    null
  );
  const [isTransitioning, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFeedbackData>({
    resolver: zodResolver(eventFeedbackSchema),
    mode: 'onBlur',
    defaultValues: { eventDate },
  });

  const onSubmit = (data: EventFeedbackData) => {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('liked', data.liked);
    formData.append('improve', data.improve);
    formData.append('eventDate', eventDate);
    formData.append('_honey', data._honey || '');

    startTransition(() => {
      formAction(formData);
    });
  };

  const getFieldError = (field: keyof EventFeedbackData) =>
    errors[field]?.message ||
    (state && !state.ok ? state.fieldErrors?.[field] : undefined);

  const busy = isPending || isTransitioning;

  // Success replaces the form rather than routing away: people fill this in on
  // a phone as they are leaving, and a page load is one more thing to fail.
  if (state?.ok) {
    return (
      <div role="status" className="py-6 text-center">
        <Icon
          name="check-circle"
          size={44}
          className="mx-auto text-positive"
          title="Sent"
        />
        <h2 className="mt-6 font-display text-[clamp(26px,4vw,34px)] font-bold tracking-[-0.02em]">
          Thanks!
        </h2>
        <p className="mt-3 text-body text-secondary">
          We read every one. See you next Wednesday.
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
        <FormField
          label="Full name"
          name="fullName"
          required
          error={getFieldError('fullName')}
        >
          <input
            type="text"
            id="fullName"
            {...register('fullName')}
            className={fieldClass}
            autoComplete="name"
            aria-describedby={
              getFieldError('fullName') ? 'fullName-error' : undefined
            }
          />
        </FormField>

        <FormField
          label={
            <SignalLabel icon="check-circle" tone="positive">
              One thing you liked most tonight
            </SignalLabel>
          }
          name="liked"
          required
          error={getFieldError('liked')}
        >
          <textarea
            id="liked"
            rows={4}
            {...register('liked')}
            className={textareaClass}
            aria-describedby={getFieldError('liked') ? 'liked-error' : undefined}
          />
        </FormField>

        <FormField
          label={
            <SignalLabel icon="x-circle" tone="negative">
              One thing to change or improve next time
            </SignalLabel>
          }
          name="improve"
          required
          error={getFieldError('improve')}
        >
          <textarea
            id="improve"
            rows={4}
            {...register('improve')}
            className={textareaClass}
            aria-describedby={
              getFieldError('improve') ? 'improve-error' : undefined
            }
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
          {busy ? 'Sending...' : 'Send feedback'}
        </button>
      </form>
    </div>
  );
}
