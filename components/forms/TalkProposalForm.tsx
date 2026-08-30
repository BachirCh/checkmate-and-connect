'use client';

import { useActionState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  talkProposalSchema,
  type TalkProposalData,
} from '@/lib/validations/talk-proposal';
import {
  submitTalkProposalAction,
  type TalkProposalState,
} from '@/app/(public)/speak/actions';
import type { MeetupDateOption } from '@/lib/site';
import { Icon } from '@/components/ui/Icon';
import FormField, { fieldClass, selectClass, textareaClass } from './FormField';

export default function TalkProposalForm({
  dates,
}: {
  /** The Wednesdays on offer, computed on the server so the list is never stale. */
  dates: MeetupDateOption[];
}) {
  const [state, formAction, isPending] = useActionState<
    TalkProposalState,
    FormData
  >(submitTalkProposalAction, null);
  const [isTransitioning, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TalkProposalData>({
    resolver: zodResolver(talkProposalSchema),
    mode: 'onBlur',
    defaultValues: { preferredDate: dates[0]?.value ?? '' },
  });

  const onSubmit = (data: TalkProposalData) => {
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('linkedIn', data.linkedIn || '');
    formData.append('subjectTitle', data.subjectTitle);
    formData.append('subjectDescription', data.subjectDescription);
    formData.append('preferredDate', data.preferredDate);
    formData.append('_honey', data._honey || '');

    startTransition(() => {
      formAction(formData);
    });
  };

  // Client-side rules fire first; server-side ones cover what the browser
  // could not know (an expired date, a write that failed).
  const getFieldError = (field: keyof TalkProposalData) =>
    errors[field]?.message || state?.fieldErrors?.[field];

  const busy = isPending || isTransitioning;

  return (
    <div>
      {state?.error ? (
        <div
          role="alert"
          className="mb-8 rounded-input border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 p-4 text-caption text-[#ff6b6b]"
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
            placeholder="Sara Bennani"
            autoComplete="name"
            aria-describedby={
              getFieldError('fullName') ? 'fullName-error' : undefined
            }
          />
        </FormField>

        <FormField
          label="LinkedIn URL"
          name="linkedIn"
          error={getFieldError('linkedIn')}
        >
          <input
            type="url"
            id="linkedIn"
            {...register('linkedIn')}
            className={fieldClass}
            placeholder="https://linkedin.com/in/sarabennani"
            aria-describedby={
              getFieldError('linkedIn') ? 'linkedIn-error' : undefined
            }
          />
        </FormField>

        <FormField
          label="Subject title"
          name="subjectTitle"
          required
          error={getFieldError('subjectTitle')}
        >
          <input
            type="text"
            id="subjectTitle"
            {...register('subjectTitle')}
            className={fieldClass}
            placeholder="How we raised our first round in Morocco"
            aria-describedby={
              getFieldError('subjectTitle') ? 'subjectTitle-error' : undefined
            }
          />
        </FormField>

        <FormField
          label="Subject description"
          name="subjectDescription"
          required
          hint="A few lines on what you will cover."
          error={getFieldError('subjectDescription')}
        >
          <textarea
            id="subjectDescription"
            rows={6}
            {...register('subjectDescription')}
            className={textareaClass}
            placeholder="What you will talk about, and who it is for."
            aria-describedby={
              getFieldError('subjectDescription')
                ? 'subjectDescription-error'
                : undefined
            }
          />
        </FormField>

        <FormField
          label="Preferred date"
          name="preferredDate"
          required
          hint="We meet every Wednesday."
          error={getFieldError('preferredDate')}
        >
          <div className="relative">
            <select
              id="preferredDate"
              {...register('preferredDate')}
              className={selectClass}
              aria-describedby={
                getFieldError('preferredDate')
                  ? 'preferredDate-error'
                  : undefined
              }
            >
              {dates.map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
            <Icon
              name="caret-down"
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        </FormField>

        {/* Honeypot — hidden from people, irresistible to bots. */}
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
          className="inline-flex h-12 w-full touch-manipulation items-center justify-center rounded-pill bg-lime px-7 text-ui font-semibold text-canvas transition-colors hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[220px]"
        >
          {busy ? 'Sending...' : 'Send suggestion'}
        </button>

        <p className="text-micro text-muted">
          No slot is booked yet. We will confirm before the date.
        </p>
      </form>
    </div>
  );
}
