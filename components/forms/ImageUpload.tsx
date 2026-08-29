'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ImageUploadProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  onChange: (file: File | undefined) => void;
  value: File | undefined;
}

export default function ImageUpload({
  label,
  name,
  required,
  error,
  onChange,
  value,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Create preview when file changes
  useEffect(() => {
    if (value) {
      // Revoke old object URL to free memory
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      // Create new preview
      const url = URL.createObjectURL(value);
      objectUrlRef.current = url;
      setPreview(url);
    } else {
      // Revoke and clear preview
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreview(null);
    }
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onChange(file);
  };

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
        ) : null}
      </label>

      <p className="mt-1.5 text-micro text-muted">JPEG, PNG or WebP, up to 5MB.</p>

      <div className="mt-2.5 flex items-center gap-5">
        {/* Square preview matching the directory grid, so people see the crop
            they will actually get rather than a circle that lies about it. */}
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-input border border-line bg-raised">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              aria-hidden
              className="grid h-full w-full place-items-center text-micro text-muted"
            >
              No photo
            </div>
          )}
        </div>

        <input
          type="file"
          id={name}
          name={name}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="block w-full text-caption text-secondary file:mr-4 file:cursor-pointer file:rounded-pill file:border-0 file:bg-raised file:px-5 file:py-2.5 file:font-sans file:text-ui file:font-medium file:text-ink hover:file:bg-line file:touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>

      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-2 text-micro text-[#ff6b6b]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
