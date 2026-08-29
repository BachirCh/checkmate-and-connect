import React from 'react';

/**
 * Shared input treatment for every text field on the site.
 *
 * Exported rather than repeated per-input: the old form hand-wrote the same
 * long class string five times, so restyling meant five chances to miss one.
 *
 * `text-[16px]` is deliberate and must not be reduced — iOS Safari zooms the
 * viewport when a focused input's font-size is under 16px.
 */
export const fieldClass =
  'w-full h-12 px-4 text-[16px] font-sans bg-raised border border-line rounded-input text-ink placeholder:text-muted transition-colors focus:border-lime focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime touch-manipulation';

interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  /** Optional helper text under the label. */
  hint?: string;
  children: React.ReactNode;
}

export default function FormField({
  label,
  name,
  required,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-caption font-medium text-ink">
        {label}
        {required ? (
          <abbr
            title="required"
            aria-label="required"
            className="ml-1 text-lime no-underline"
          >
            *
          </abbr>
        ) : (
          <span className="ml-2 text-caption font-normal text-faint">optional</span>
        )}
      </label>

      {hint ? <p className="mt-1.5 text-micro text-muted">{hint}</p> : null}

      <div className="mt-2.5">{children}</div>

      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-2 text-micro text-[#ff6b6b]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
