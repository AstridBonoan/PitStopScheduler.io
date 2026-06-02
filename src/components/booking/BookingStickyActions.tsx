import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Sticky booking CTAs — sits above mobile bottom nav + home indicator, opaque bar on phone */
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
        'sticky z-30 mt-8',
        'bottom-[var(--booking-actions-bottom)]',
        '-mx-4 border-t border-slate-200 bg-white px-4 pt-4 pb-3',
        'shadow-[0_-8px_24px_rgba(15,23,42,0.1)]',
        'md:static md:bottom-auto md:mx-0 md:border-0 md:bg-transparent md:p-0 md:shadow-none',
        className,
      )}
    >
      {children}
    </div>
  )
}
