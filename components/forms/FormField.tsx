import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export default function FormField({ label, name, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-white">
        {label}
        {required && (
          <abbr title="required" aria-label="required" className="ml-1 text-white no-underline">
            *
          </abbr>
        )}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
