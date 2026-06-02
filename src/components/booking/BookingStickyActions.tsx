import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Opaque CTA bar — on mobile sits at bottom of BookingStepShell, just above tab nav */
export function BookingStickyActions({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'shrink-0',
        '-mx-4 border-t border-slate-200 bg-white px-4 pt-3 pb-2',
        'shadow-[0_-4px_16px_rgba(15,23,42,0.08)]',
        'md:mx-0 md:mt-8 md:border-0 md:bg-transparent md:p-0 md:shadow-none',
        className,
      )}
    >
      {children}
    </div>
  )
}
