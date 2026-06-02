import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useBooking } from '@/contexts/BookingContext'
import { fetchBlockedDates, fetchHolidays, isDateBookable } from '@/services/bookingService'
import { cn } from '@/lib/utils'
import { BookingStepShell } from '@/components/booking/BookingStepShell'
import { BookingStickyActions } from '@/components/booking/BookingStickyActions'
import { Button } from '@/components/ui/Button'

export function DateStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { draft, selectDate } = useBooking()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [blocked, setBlocked] = useState<string[]>([])
  const [holidays, setHolidays] = useState<string[]>([])

  useEffect(() => {
    Promise.all([fetchBlockedDates(), fetchHolidays()]).then(([b, h]) => {
      setBlocked(b)
      setHolidays(h)
    })
  }, [])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return eachDayOfInterval({ start, end })
  }, [month])

  return (
    <BookingStepShell
      actions={
        <BookingStickyActions className="flex gap-3">
          <Button variant="outline" className="flex-1" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button className="flex-1" size="lg" solidDisabled disabled={!draft.date} onClick={onNext}>
            Continue
          </Button>
        </BookingStickyActions>
      }
    >
      <h1 className="text-2xl font-bold text-slate-900">Choose a date</h1>
      <p className="mt-1 text-slate-500">Only available dates can be selected.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonth(subMonths(month, 1))}
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h2 className="font-semibold">{format(month, 'MMMM yyyy')}</h2>
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, 1))}
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Next month"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Appointment calendar">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const bookable = isDateBookable(day, blocked, holidays)
            const selected = draft.date === key
            const inMonth = isSameMonth(day, month)

            return (
              <button
                key={key}
                type="button"
                disabled={!bookable || !inMonth}
                onClick={() => selectDate(key)}
                className={cn(
                  'aspect-square min-h-[44px] rounded-xl text-sm font-medium transition-colors',
                  !inMonth && 'text-slate-300',
                  inMonth && !bookable && 'text-slate-300 line-through',
                  inMonth && bookable && 'hover:bg-brand-50 text-slate-900',
                  selected && 'bg-brand-600 text-white hover:bg-brand-600',
                  isSameDay(day, new Date()) && !selected && 'ring-1 ring-brand-300',
                )}
                aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                aria-selected={selected}
                role="gridcell"
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>
    </BookingStepShell>
  )
}
