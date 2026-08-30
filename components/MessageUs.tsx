'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { lockBodyScroll } from '@/lib/bodyScrollLock';
import { site } from '@/lib/site';

/**
 * "Message us" is the secondary CTA everywhere the primary is "Follow on
 * LinkedIn". There is no contact form and no inbox to run, so the dialog just
 * hands over the two channels an organiser actually watches.
 *
 * Deliberately not a <dialog>: the native element's backdrop cannot be styled
 * from a token and its top-layer stacking fights the sticky nav on iOS.
 */
export function MessageUsButton({
  className,
  label = 'Message us',
}: {
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open ? <MessageUsDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function MessageUsDialog({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes, and focus starts inside the panel rather than wherever the
  // trigger left it.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Don't let the page scroll behind the panel. Ref-counted, because on
  // mobile this opens from inside the already-locked nav drawer.
  useEffect(() => lockBodyScroll(), []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-us-heading"
      onMouseDown={(e) => {
        if (!panelRef.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm" aria-hidden />

      <div
        ref={panelRef}
        className="relative w-full max-w-[520px] rounded-card border border-line bg-surface p-6 text-left md:p-9"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-pill border border-line text-secondary transition-colors hover:border-ink/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
        >
          <span className="sr-only">Close</span>
          <span aria-hidden className="relative block h-4 w-4">
            <span className="absolute left-0 top-1/2 block h-0.5 w-4 rotate-45 bg-current" />
            <span className="absolute left-0 top-1/2 block h-0.5 w-4 -rotate-45 bg-current" />
          </span>
        </button>

        <p className="text-eyebrow font-semibold uppercase text-lime">Get in touch</p>
        <h2
          id="message-us-heading"
          className="mt-4 max-w-[14ch] font-display text-[clamp(26px,4vw,36px)] font-bold leading-[1.1] tracking-[-0.02em]"
        >
          Leave us a message.
        </h2>

        <ul className="mt-8 flex flex-col gap-3">
          <li>
            <a
              href={site.contact.linkedinMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-card border border-line bg-raised p-5 transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            >
              <Icon name="linkedin-logo" size={22} className="mt-0.5 shrink-0 text-lime" />
              <span>
                <span className="block text-ui font-medium text-ink">Message us on LinkedIn</span>
                <span className="mt-1 block text-caption text-secondary">
                  {site.contact.responseTime}
                </span>
              </span>
              <Icon name="arrow-up-right" size={18} className="ml-auto mt-1 shrink-0 text-faint" />
            </a>
          </li>

          <li>
            <a
              href={site.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-card border border-line bg-raised p-5 transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
            >
              <Icon name="whatsapp-logo" size={22} className="mt-0.5 shrink-0 text-lime" />
              <span>
                <span className="block text-ui font-medium text-ink">Or send a WhatsApp</span>
                <span className="mt-1 block text-caption text-secondary tabular-nums">
                  {site.contact.whatsappNumber}
                </span>
              </span>
              <Icon name="arrow-up-right" size={18} className="ml-auto mt-1 shrink-0 text-faint" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
