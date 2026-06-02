import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Mobile: fills space between header and bottom nav; CTA bar pinned to the bottom.
 * Desktop: normal document flow.
 */
export function BookingStepShell({
  children,
  actions,
}: {
  children: ReactNode
  actions: ReactNode
}) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col', 'md:min-h-0 md:flex-none')}>
      <div className="flex-1 overflow-y-auto overscroll-y-contain md:overflow-visible">{children}</div>
      {actions}
    </div>
  )
}
