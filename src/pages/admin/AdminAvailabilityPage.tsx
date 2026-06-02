import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { blockDate, setSlotAvailability } from '@/services/bookingService'
import { TIME_SLOTS, type TimeSlotValue } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
export function AdminAvailabilityPage() {
  const { isAdmin, loading } = useAuth()
  const [blockDateValue, setBlockDateValue] = useState('')
  const [slotDate, setSlotDate] = useState('')
  const [slotTime, setSlotTime] = useState<TimeSlotValue>(TIME_SLOTS[0].value)
  const [message, setMessage] = useState<string | null>(null)

  if (!loading && !isAdmin) return <Navigate to="/admin" replace />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Availability</h1>
      <p className="mt-1 text-slate-500">Block dates, time slots, and manage business hours.</p>

      <Card className="mt-6">
        <h2 className="font-semibold">Block a date</h2>
        <p className="mt-1 text-sm text-slate-500">Customers will not be able to book on blocked dates.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="date"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3"
            value={blockDateValue}
            onChange={(e) => setBlockDateValue(e.target.value)}
            aria-label="Date to block"
          />
          <Button
            onClick={async () => {
              if (!blockDateValue) return
              await blockDate(blockDateValue)
              setMessage(`Blocked ${blockDateValue}`)
            }}
          >
            Block date
          </Button>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold">Block a time slot</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            type="date"
            className="rounded-xl border border-slate-300 px-4 py-3"
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
            aria-label="Slot date"
          />
          <select
            className="rounded-xl border border-slate-300 px-4 py-3"
            value={slotTime}
            onChange={(e) => setSlotTime(e.target.value as TimeSlotValue)}
            aria-label="Time slot"
          >
            {TIME_SLOTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Button
            variant="danger"
            onClick={async () => {
              if (!slotDate) return
              await setSlotAvailability(slotDate, slotTime, false)
              setMessage(`Blocked ${slotTime} on ${slotDate}`)
            }}
          >
            Block slot
          </Button>
        </div>
        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={async () => {
            if (!slotDate) return
            await setSlotAvailability(slotDate, slotTime, true)
            setMessage(`Opened ${slotTime} on ${slotDate}`)
          }}
        >
          Re-open slot
        </Button>
      </Card>

      <Card className="mt-6">
        <h2 className="font-semibold">Business hours</h2>
        <p className="mt-1 text-sm text-slate-500">
          Default: Mon–Fri 9 AM–4 PM, Sat 9 AM–1 PM, Sun closed. Configure in Supabase{' '}
          <code className="text-xs">business_hours</code> table for production.
        </p>
      </Card>

      {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
    </div>
  )
}
