'use client';

import { useEffect, useState } from 'react';

const CHAPTERS = 'details[data-chapter]';

/**
 * Progressive enhancement for the chapter accordions on /terms.
 *
 * The chapters are native <details>, so the page reads and expands without any
 * JavaScript. This adds what <details> can't do alone: open the chapter a link
 * or URL hash points at, and an expand/collapse-all toggle.
 */
export default function ChapterControls() {
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const chapters = () => Array.from(document.querySelectorAll<HTMLDetailsElement>(CHAPTERS));
    const sync = () => setAllOpen(chapters().every((chapter) => chapter.open));

    const openFromHash = () => {
      const target = chapters().find((chapter) => `#${chapter.id}` === location.hash);
      if (target) target.open = true;
      sync();
    };

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-chapter]');
      if (!link) return;
      const target = document.getElementById(link.dataset.chapter ?? '');
      if (target instanceof HTMLDetailsElement) target.open = true;
    };

    openFromHash();
    chapters().forEach((chapter) => chapter.addEventListener('toggle', sync));
    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', openFromHash);

    return () => {
      chapters().forEach((chapter) => chapter.removeEventListener('toggle', sync));
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', openFromHash);
    };
  }, []);

  const toggleAll = () => {
    const chapters = Array.from(document.querySelectorAll<HTMLDetailsElement>(CHAPTERS));
    const shouldOpen = chapters.some((chapter) => !chapter.open);
    chapters.forEach((chapter) => {
      chapter.open = shouldOpen;
    });
    setAllOpen(shouldOpen);
  };

  return (
    <button
      type="button"
      onClick={toggleAll}
      className="text-ui font-medium text-secondary underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime rounded-badge"
    >
      {allOpen ? 'Collapse all chapters' : 'Expand all chapters'}
    </button>
  );
}
