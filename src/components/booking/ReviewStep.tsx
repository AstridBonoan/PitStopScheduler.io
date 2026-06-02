import { format, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { useBooking } from '@/contexts/BookingContext'
import { createAppointment, fetchServices } from '@/services/bookingService'
import { TIME_SLOTS } from '@/lib/constants'
import type { Service } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import { BookingStepShell } from '@/components/booking/BookingStepShell'
import { BookingStickyActions } from '@/components/booking/BookingStickyActions'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function ReviewStep({
  onBack,
  onSuccess,
}: {
  onBack: () => void
  onSuccess: (confirmationNumber: string) => void
}) {
  const { draft } = useBooking()
  const [services, setServices] = useState<Service[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices().then(setServices)
  }, [])

  const service = services.find((s) => s.id === draft.serviceId)
  const timeLabel = TIME_SLOTS.find((t) => t.value === draft.time)?.label

  const handleSubmit = async () => {
    if (!service) return
    setSubmitting(true)
    setError(null)
    try {
      const appointment = await createAppointment(draft, service)
      onSuccess(appointment.confirmation_number)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const dateLabel = draft.date ? format(parseISO(draft.date), 'EEEE, MMMM d, yyyy') : ''

  return (
    <BookingStepShell
      actions={
        <BookingStickyActions className="flex gap-3">
          <Button variant="outline" className="flex-1" size="lg" onClick={onBack} disabled={submitting}>
            Edit
          </Button>
          <Button className="flex-1" size="lg" solidDisabled loading={submitting} onClick={handleSubmit}>
            Confirm booking
          </Button>
        </BookingStickyActions>
      }
    >
      <h1 className="text-2xl font-bold text-slate-900">Review your booking</h1>
      <p className="mt-1 text-slate-500">Confirm everything looks correct before submitting.</p>

      <Card className="mt-6 space-y-4">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Service</h2>
          <p className="mt-1 font-medium">{service?.name}</p>
          <p className="text-sm text-slate-600">
            {service ? formatCurrency(service.price) : ''} · {service?.duration} min
          </p>
        </section>
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date & time</h2>
          <p className="mt-1 font-medium">
            {dateLabel} at {timeLabel}
          </p>
        </section>
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vehicle</h2>
          <p className="mt-1 font-medium">
            {draft.vehicle?.year} {draft.vehicle?.make} {draft.vehicle?.model}
          </p>
          <p className="text-sm text-slate-600">
            {draft.vehicle?.mileage?.toLocaleString()} miles
            {draft.vehicle?.licensePlate ? ` · ${draft.vehicle.licensePlate}` : ''}
          </p>
        </section>
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</h2>
          <p className="mt-1 font-medium">{draft.customer?.fullName}</p>
          <p className="text-sm text-slate-600">
            {draft.customer?.phone} · {draft.customer?.email}
          </p>
          {draft.customer?.notes ? (
            <p className="mt-2 text-sm text-slate-600">Notes: {draft.customer.notes}</p>
          ) : null}
        </section>
      </Card>

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </BookingStepShell>
  )
}
