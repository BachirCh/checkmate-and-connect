"use client";

import { useState } from "react";
import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  eventSubmissionSchema,
  type EventSubmissionData,
} from "@/lib/validations/event-submission";
import { submitEventAction } from "@/app/actions/events";
import FormField from "./FormField";
import ImageUpload from "./ImageUpload";

export default function EventSubmissionForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [state, formAction, isPending] = useActionState(
    submitEventAction,
    null,
  );
  const [isTransitioning, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventSubmissionData>({
    resolver: zodResolver(eventSubmissionSchema),
    mode: "onBlur",
  });

  const imageValue = watch("image");
  const eventTypeValue = watch("eventType");

  const onSubmit = async (data: EventSubmissionData) => {
    // Get reCAPTCHA token before submission
    if (!executeRecaptcha) {
      console.error('reCAPTCHA not available');
      return;
    }
    const recaptchaToken = await executeRecaptcha('event_submission');

    // Create FormData and append all fields
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("eventType", data.eventType);
    formData.append("eventDateTime", data.eventDateTime || "");
    formData.append("recurrencePattern", data.recurrencePattern || "");
    formData.append("author", data.author);
    if (data.image && data.image.size > 0) {
      formData.append("image", data.image);
    }
    formData.append("recaptchaToken", recaptchaToken);
    formData.append("_honey", data._honey || "");

    // Call the server action inside a transition
    startTransition(() => {
      formAction(formData);
    });
  };

  // Merge client-side and server-side errors
  const getFieldError = (fieldName: keyof EventSubmissionData) => {
    const clientError = errors[fieldName]?.message;
    const serverError = state?.fieldErrors?.[fieldName as keyof typeof state.fieldErrors];
    return clientError || serverError;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {state?.error && (
        <div
          role="alert"
          className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded text-red-400"
        >
          {state.error}
        </div>
      )}

      <form
        id="event-submission-form"
        action={formAction}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          label="Event Title"
          name="title"
          required
          error={getFieldError("title")}
        >
          <input
            type="text"
            id="title"
            {...register("title")}
            className="w-full h-12 px-4 text-base text-[16px] bg-black border border-gray-800 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white touch-manipulation"
            placeholder="Chess Workshop for Beginners"
            aria-describedby={getFieldError("title") ? "title-error" : undefined}
          />
        </FormField>

        <FormField
          label="Description"
          name="description"
          required
          error={getFieldError("description")}
        >
          <textarea
            id="description"
            {...register("description")}
            rows={4}
            className="w-full px-4 py-3 text-base text-[16px] bg-black border border-gray-800 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white touch-manipulation resize-none"
            placeholder="Describe your event (20-500 characters)..."
            aria-describedby={getFieldError("description") ? "description-error" : undefined}
          />
        </FormField>

        <FormField
          label="Event Type"
          name="eventType"
          required
          error={getFieldError("eventType")}
        >
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                value="one-time"
                {...register("eventType")}
                className="w-4 h-4 text-white bg-black border-gray-800 focus:ring-white focus:ring-2"
              />
              <span className="text-white">One-Time Event</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                value="recurring"
                {...register("eventType")}
                className="w-4 h-4 text-white bg-black border-gray-800 focus:ring-white focus:ring-2"
              />
              <span className="text-white">Recurring Event</span>
            </label>
          </div>
        </FormField>

        {/* Conditional field: Event Date & Time (one-time events only) */}
        {eventTypeValue === 'one-time' && (
          <FormField
            label="Event Date & Time"
            name="eventDateTime"
            required
            error={getFieldError("eventDateTime")}
          >
            <input
              type="datetime-local"
              id="eventDateTime"
              {...register("eventDateTime")}
              className="w-full h-12 px-4 text-base text-[16px] bg-black border border-gray-800 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white touch-manipulation"
              aria-describedby={getFieldError("eventDateTime") ? "eventDateTime-error" : undefined}
            />
          </FormField>
        )}

        {/* Conditional field: Recurrence Pattern (recurring events only) */}
        {eventTypeValue === 'recurring' && (
          <FormField
            label="Recurrence Pattern"
            name="recurrencePattern"
            required
            error={getFieldError("recurrencePattern")}
          >
            <input
              type="text"
              id="recurrencePattern"
              {...register("recurrencePattern")}
              className="w-full h-12 px-4 text-base text-[16px] bg-black border border-gray-800 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white touch-manipulation"
              placeholder="Every Saturday at 10:00 AM"
              aria-describedby={getFieldError("recurrencePattern") ? "recurrencePattern-error" : undefined}
            />
          </FormField>
        )}

        <FormField
          label="Organizer Name"
          name="author"
          required
          error={getFieldError("author")}
        >
          <input
            type="text"
            id="author"
            {...register("author")}
            className="w-full h-12 px-4 text-base text-[16px] bg-black border border-gray-800 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white touch-manipulation"
            placeholder="John Doe"
            aria-describedby={getFieldError("author") ? "author-error" : undefined}
          />
        </FormField>

        <ImageUpload
          label="Event Image (Optional)"
          name="image"
          error={getFieldError("image")}
          value={imageValue}
          onChange={(file) => setValue("image", file as any)}
        />

        {/* Honeypot field - hidden from users */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="_honey">Leave this field empty</label>
          <input
            type="text"
            id="_honey"
            {...register("_honey")}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={isPending || isTransitioning}
          className="w-full h-12 sm:h-14 px-6 bg-white text-black font-medium rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
        >
          {isPending || isTransitioning ? "Submitting..." : "Submit Event"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          By submitting, you agree to have your event reviewed for inclusion
          in our events calendar.
        </p>
      </form>
    </div>
  );
}
