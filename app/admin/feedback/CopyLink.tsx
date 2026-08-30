'use client';

import { useEffect, useState } from 'react';

/**
 * The share link, with a one-click copy.
 *
 * The origin is read on the client rather than baked in: the same page is used
 * on localhost, on the staging Worker and in production, and a copied link
 * pointing at the wrong host is worse than no button.
 */
export default function CopyLink({ path }: { path: string }) {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);

  const url = origin ? `${origin}${path}` : path;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked outside a secure context; the input below is
      // still selectable, so there is nothing to recover from.
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-md border border-[#333333] bg-black px-3 py-2 font-mono text-sm text-white"
        aria-label="Feedback form link"
      />
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-200"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
