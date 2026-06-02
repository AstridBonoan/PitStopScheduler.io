import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchCustomerAppointments,
  formatAppointmentDateTime,
  updateAppointmentStatus,
} from '@/services/bookingService'
import type { Appointment } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Card, EmptyState, StatusBadge } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const emailSchema = z.object({ email: z.string().email() })

export function AccountPage() {
  const { signInWithMagicLink, signOut, role, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [email, setEmail] = useState(localStorage.getItem('pss_mock_email') ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email },
  })

  const loadAppointments = async (userEmail: string) => {
    setLoading(true)
    const data = await fetchCustomerAppointments(userEmail)
    setAppointments(data)
    setLoading(false)
  }

  useEffect(() => {
    if (email) void loadAppointments(email)
  }, [email])

  const onMagicLink = async (data: { email: string }) => {
    const result = await signInWithMagicLink(data.email)
    if (result.error) setMessage(result.error)
    else {
      setEmail(data.email)
      setMessage('Check your email for the magic link to access your dashboard.')
    }
  }

  const upcoming = appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'completed')
  const history = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled')

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My appointments</h1>
      <p className="mt-1 text-slate-500">Sign in with your email magic link to manage bookings.</p>

      <Card className="mt-6">
        <form onSubmit={handleSubmit(onMagicLink)} className="space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Button type="submit" className="w-full" loading={authLoading}>
            Send magic link
          </Button>
        </form>
        {message ? <p className="mt-3 text-sm text-brand-600">{message}</p> : null}
        {email ? (
          <Button variant="ghost" className="mt-2 w-full" onClick={() => signOut()}>
            Sign out
          </Button>
        ) : null}
      </Card>

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Loading appointments…</p>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="font-semibold text-slate-900">Upcoming</h2>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={<Calendar className="size-10" />}
                title="No upcoming appointments"
                description="Book a service to see your appointments here."
              />
            ) : (
              <div className="mt-4 space-y-3">
                {upcoming.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} onChange={() => loadAppointments(email)} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8">
            <h2 className="font-semibold text-slate-900">History</h2>
            {history.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No past appointments yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {history.map((a) => (
                  <AppointmentCard key={a.id} appointment={a} onChange={() => loadAppointments(email)} readonly />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {role === 'admin' ? (
        <p className="mt-6 text-sm text-slate-500">
          You are signed in as admin. Visit the <a href="/admin" className="text-brand-600 underline">admin dashboard</a>.
        </p>
      ) : null}
    </div>
  )
}

function AppointmentCard({
  appointment,
  onChange,
  readonly,
}: {
  appointment: Appointment
  onChange: () => void
  readonly?: boolean
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{appointment.service?.name ?? 'Service'}</p>
          <p className="text-sm text-slate-600">
            {formatAppointmentDateTime(appointment.appointment_date, appointment.appointment_time)}
          </p>
          <p className="text-xs text-slate-500">#{appointment.confirmation_number}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      {!readonly && appointment.status !== 'cancelled' ? (
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={async () => {
              await updateAppointmentStatus(appointment.id, 'cancelled')
              onChange()
            }}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={async () => {
              await updateAppointmentStatus(appointment.id, 'rescheduled', {
                appointment_date: appointment.appointment_date,
                appointment_time: '14:00',
              })
              onChange()
            }}
          >
            Reschedule
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
