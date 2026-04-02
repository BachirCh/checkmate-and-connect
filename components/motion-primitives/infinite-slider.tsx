'use client'

import { cn } from '@/lib/utils'
import { useMotionValue, animate, motion } from 'motion/react'
import { useState, useEffect, useRef, useCallback } from 'react'

interface InfiniteSliderProps {
  children: React.ReactNode
  gap?: number
  speed?: number
  speedOnHover?: number
  direction?: 'horizontal' | 'vertical'
  reverse?: boolean
  className?: string
}

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 40,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentSpeed, setCurrentSpeed] = useState(speed)
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [innerWidth, setInnerWidth] = useState(0)
  const [innerHeight, setInnerHeight] = useState(0)
  const translation = useMotionValue(0)
  const animationRef = useRef<ReturnType<typeof animate> | null>(null)

  const isHorizontal = direction === 'horizontal'

  useEffect(() => {
    if (!innerRef.current) return
    if (isHorizontal) {
      setInnerWidth(innerRef.current.scrollWidth / 2)
    } else {
      setInnerHeight(innerRef.current.scrollHeight / 2)
    }
  }, [children, gap, isHorizontal])

  const startAnimation = useCallback(() => {
    const size = isHorizontal ? innerWidth : innerHeight
    if (size === 0) return

    const from = reverse ? -size : 0
    const to = reverse ? 0 : -size
    const current = translation.get()

    // Calculate remaining distance
    const remaining = Math.abs(to - current)
    const total = Math.abs(to - from)
    const duration = (remaining / total) * (total / currentSpeed)

    animationRef.current?.stop()
    animationRef.current = animate(translation, to, {
      duration,
      ease: 'linear',
      onComplete: () => {
        translation.set(from)
        startAnimation()
      },
    })
  }, [isHorizontal, innerWidth, innerHeight, currentSpeed, reverse, translation])

  useEffect(() => {
    startAnimation()
    return () => {
      animationRef.current?.stop()
    }
  }, [startAnimation])

  const handleHoverStart = () => {
    if (speedOnHover !== undefined) {
      setCurrentSpeed(speedOnHover)
    }
  }

  const handleHoverEnd = () => {
    setCurrentSpeed(speed)
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden', className)}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >
      <motion.div
        ref={innerRef}
        className="flex w-max"
        style={{
          gap,
          flexDirection: isHorizontal ? 'row' : 'column',
          ...(isHorizontal ? { x: translation } : { y: translation }),
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}
