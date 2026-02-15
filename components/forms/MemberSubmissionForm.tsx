"use client";

import { useActionState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  memberSubmissionSchema,
  type MemberSubmissionData,
} from "@/lib/validations/member-submission";
import { submitMemberAction } from "@/app/(public)/join/actions";
import FormField from "./FormField";
import ImageUpload from "./ImageUpload";

export default function MemberSubmissionForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
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
    // Get reCAPTCHA token before submission (TEMPORARILY DISABLED)
    // TODO: Re-enable after configuring reCAPTCHA properly
    // if (!executeRecaptcha) {
    //   console.error('reCAPTCHA not available');
    //   return;
    // }
    // const recaptchaToken = await executeRecaptcha('member_submission');

    // Create FormData and append all fields
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("jobTitle", data.jobTitle);
    formData.append("company", data.company || "");
    formData.append("linkedIn", data.linkedIn || "");
    formData.append("photo", data.photo);
    formData.append("recaptchaToken", "disabled-for-testing"); // Placeholder
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
        id="member-submission-form"
        action={formAction}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
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
            className="w-full h-12 px-4 text-base text-[16px] bg-black border border-gray-800 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white touch-manipulation"
            placeholder="John Doe"
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
            className="w-full h-12 px-4 text-base text-[16px] bg-black border border-gray-800 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white touch-manipulation"
            placeholder="Product Manager"
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
            className="w-full h-12 px-4 text-base text-[16px] bg-black border border-gray-800 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white touch-manipulation"
            placeholder="Acme Corp"
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
            className="w-full h-12 px-4 text-base text-[16px] bg-black border border-gray-800 rounded text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white touch-manipulation"
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
          className="w-full h-12 sm:h-14 px-6 bg-white text-black font-medium rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-colors"
        >
          {isPending || isTransitioning ? "Submitting..." : "Submit Application"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          By submitting, you agree to have your profile reviewed for inclusion
          in our member directory.
        </p>
      </form>
    </div>
  );
}
