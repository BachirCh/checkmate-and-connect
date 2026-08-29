import type { ReactNode } from 'react';

/**
 * The page gutter.
 *
 * Figma is a 1440 artboard with 120px margins, so content is 1200 wide. Below
 * that we step the gutter down rather than letting it scale, which keeps the
 * measure comfortable on tablets and tight on phones.
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1440px] px-6 md:px-10 lg:px-[120px] ${className ?? ''}`}
    >
      {children}
    </div>
  );
}
