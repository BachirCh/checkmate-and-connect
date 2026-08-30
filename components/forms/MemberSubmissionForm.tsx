"use client";

import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  memberSubmissionSchema,
  type MemberSubmissionData,
} from "@/lib/validations/member-submission";
import { submitMemberAction } from "@/app/(public)/join/actions";
import FormField, { fieldClass } from "./FormField";
import ImageUpload from "./ImageUpload";

export default function MemberSubmissionForm() {
  const [state, formAction, isPending] = useActionState(
    submitMemberAction,
    null,
  );
  const [isTransitioning, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemberSubmissionData>({
    resolver: zodResolver(memberSubmissionSchema),
    mode: "onBlur",
  });

  const photoValue = watch("photo");

  const onSubmit = async (data: MemberSubmissionData) => {
    // Create FormData and append all fields
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("jobTitle", data.jobTitle);
    formData.append("company", data.company || "");
    formData.append("linkedIn", data.linkedIn || "");
    formData.append("photo", data.photo);
    formData.append("_honey", data._honey || "");

    // Call the server action inside a transition
    startTransition(() => {
      formAction(formData);
    });
  };

  // Merge client-side and server-side errors
  const getFieldError = (fieldName: keyof MemberSubmissionData) => {
    const clientError = errors[fieldName]?.message;
    const serverError = state?.fieldErrors?.[fieldName];
    return clientError || serverError;
  };

  return (
    <div>
      {state?.error && (
        <div
          role="alert"
          className="mb-8 rounded-input border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 p-4 text-caption text-[#ff6b6b]"
        >
          {state.error}
        </div>
      )}

      <form
        id="member-submission-form"
        action={formAction}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-7"
      >
        <FormField
          label="Full Name"
          name="name"
          required
          error={getFieldError("name")}
        >
          <input
            type="text"
            id="name"
            {...register("name")}
            className={fieldClass}
            aria-describedby={getFieldError("name") ? "name-error" : undefined}
          />
        </FormField>

        <FormField
          label="Job Title"
          name="jobTitle"
          required
          error={getFieldError("jobTitle")}
        >
          <input
            type="text"
            id="jobTitle"
            {...register("jobTitle")}
            className={fieldClass}
            aria-describedby={
              getFieldError("jobTitle") ? "jobTitle-error" : undefined
            }
          />
        </FormField>

        <FormField
          label="Company"
          name="company"
          error={getFieldError("company")}
        >
          <input
            type="text"
            id="company"
            {...register("company")}
            className={fieldClass}
            aria-describedby={
              getFieldError("company") ? "company-error" : undefined
            }
          />
        </FormField>

        <FormField
          label="LinkedIn URL"
          name="linkedIn"
          error={getFieldError("linkedIn")}
        >
          <input
            type="url"
            id="linkedIn"
            {...register("linkedIn")}
            className={fieldClass}
            placeholder="https://linkedin.com/in/johndoe"
            aria-describedby={
              getFieldError("linkedIn") ? "linkedIn-error" : undefined
            }
          />
        </FormField>

        <ImageUpload
          label="Profile Photo"
          name="photo"
          required
          error={getFieldError("photo")}
          value={photoValue}
          onChange={(file) => setValue("photo", file as any)}
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
          className="inline-flex h-12 w-full items-center justify-center rounded-pill bg-lime px-7 text-ui font-semibold text-canvas transition-colors hover:bg-lime/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation sm:w-auto sm:min-w-[220px]"
        >
          {isPending || isTransitioning ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
