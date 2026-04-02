'use client'

import { cn } from '@/lib/utils'

interface ProgressiveBlurProps {
  className?: string
  direction?: 'left' | 'right'
  blurIntensity?: number
}

export function ProgressiveBlur({
  className,
  direction = 'left',
  blurIntensity = 1,
}: ProgressiveBlurProps) {
  const maxBlur = blurIntensity * 8

  return (
    <div
      className={cn('pointer-events-none', className)}
      style={{
        maskImage:
          direction === 'left'
            ? 'linear-gradient(to right, black, transparent)'
            : 'linear-gradient(to left, black, transparent)',
        backdropFilter: `blur(${maxBlur}px)`,
        WebkitBackdropFilter: `blur(${maxBlur}px)`,
      }}
    />
  )
}
