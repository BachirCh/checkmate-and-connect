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
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-white">
        {label}
        {required && (
          <abbr title="required" aria-label="required" className="ml-1 text-white no-underline">
            *
          </abbr>
        )}
      </label>

      <input
        type="file"
        id={name}
        name={name}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="block w-full text-base text-white file:mr-4 file:py-3 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-white file:text-black hover:file:bg-gray-200 file:cursor-pointer file:touch-manipulation border border-gray-800 rounded bg-black touch-manipulation"
        aria-describedby={error ? `${name}-error` : undefined}
      />

      <p className="text-sm text-gray-400">JPEG, PNG, or WebP. Maximum 5MB.</p>

      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-800"
          />
        </div>
      )}

      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
