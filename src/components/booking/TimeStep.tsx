import { useEffect, useState } from 'react'
import { useBooking } from '@/contexts/BookingContext'
import { getAvailableSlots } from '@/services/bookingService'
import type { TimeSlot } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { BookingStepShell } from '@/components/booking/BookingStepShell'
import { BookingStickyActions } from '@/components/booking/BookingStickyActions'
import { Button } from '@/components/ui/Button'

export function TimeStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { draft, selectTime } = useBooking()
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!draft.date) return
    setLoading(true)
    getAvailableSlots(draft.date)
      .then(setSlots)
      .finally(() => setLoading(false))
  }, [draft.date])

  return (
    <BookingStepShell
      actions={
        <BookingStickyActions className="flex gap-3">
          <Button variant="outline" className="flex-1" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button className="flex-1" size="lg" solidDisabled disabled={!draft.time} onClick={onNext}>
            Continue
          </Button>
        </BookingStickyActions>
      }
    >
      <h1 className="text-2xl font-bold text-slate-900">Pick a time</h1>
      <p className="mt-1 text-slate-500">Available slots update in real time.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3" role="list">
        {loading ? (
          <p className="col-span-full text-sm text-slate-500">Loading availability…</p>
        ) : slots.length === 0 ? (
          <p className="col-span-full text-sm text-slate-500">No slots available for this date.</p>
        ) : (
          slots.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => selectTime(slot.value)}
              className={cn(
                'min-h-[52px] rounded-xl border text-sm font-semibold transition-colors',
                draft.time === slot.value
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-200 bg-white hover:border-brand-300',
              )}
              aria-pressed={draft.time === slot.value}
              role="listitem"
            >
              {slot.label}
            </button>
          ))
        )}
      </div>
    </BookingStepShell>
  )
}
