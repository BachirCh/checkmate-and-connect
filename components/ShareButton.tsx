'use client';

import { useState } from 'react';

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
};

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [buttonText, setButtonText] = useState('Share');

  const handleShare = async () => {
    try {
      // Check if Web Share API is available (mobile browsers)
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url,
        });
        // Share completed successfully
      } else {
        // Fallback to clipboard copy for desktop browsers
        await navigator.clipboard.writeText(url);

        // Show "Copied!" feedback
        setButtonText('Copied!');

        // Reset button text after 2 seconds
        setTimeout(() => {
          setButtonText('Share');
        }, 2000);
      }
    } catch (error) {
      // User cancelled share or clipboard write failed
      // Log error but don't crash the UI
      console.error('Share failed:', error);

      // If share was cancelled, this is normal behavior - do nothing
      // If clipboard failed, we could show an error message but for now just log it
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
      aria-label="Share this post"
    >
      <span className="text-xl" role="img" aria-label="Share icon">
        🔗
      </span>
      <span>{buttonText}</span>
    </button>
  );
}
