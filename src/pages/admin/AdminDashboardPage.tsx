import { useEffect, useMemo, useState } from 'react'
import { format, isToday, isSameMonth, parseISO, startOfMonth } from 'date-fns'
import { Link, Navigate } from 'react-router-dom'
import { Calendar, DollarSign, Users, Wrench } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchAllAppointments, updateAppointmentStatus } from '@/services/bookingService'
import type { Appointment } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import { Card, StatusBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function AdminDashboardPage() {
  const { isAdmin, loading: authLoading, signOut } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState({ date: '', service: '', status: '', customer: '' })

  useEffect(() => {
    fetchAllAppointments().then(setAppointments)
  }, [])

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (filter.status && a.status !== filter.status) return false
      if (filter.date && a.appointment_date !== filter.date) return false
      if (filter.service && a.service_id !== filter.service) return false
      if (filter.customer && !a.customer?.name.toLowerCase().includes(filter.customer.toLowerCase())) return false
      return true
    })
  }, [appointments, filter])

  const today = appointments.filter((a) => isToday(parseISO(a.appointment_date)) && a.status !== 'cancelled')
  const upcoming = appointments.filter(
    (a) => parseISO(a.appointment_date) >= new Date() && a.status !== 'cancelled' && a.status !== 'completed',
  )
  const monthly = appointments.filter(
    (a) => isSameMonth(parseISO(a.appointment_date), startOfMonth(new Date())) && a.status !== 'cancelled',
  )
  const revenue = monthly.reduce((sum, a) => sum + (a.service?.price ?? 0), 0)

  if (!authLoading && !isAdmin) return <Navigate to="/admin" replace />

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="text-slate-500">Manage bookings, availability, and shop performance.</p>
        </div>
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Calendar />} label="Today" value={String(today.length)} />
        <StatCard icon={<Users />} label="Upcoming" value={String(upcoming.length)} />
        <StatCard icon={<Wrench />} label="This month" value={String(monthly.length)} />
        <StatCard icon={<DollarSign />} label="Revenue est." value={formatCurrency(revenue)} />
      </div>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Admin sections">
        <Link to="/admin/dashboard">
          <Button variant="secondary" size="sm">
            Overview
          </Button>
        </Link>
        <Link to="/admin/calendar">
          <Button variant="outline" size="sm">
            Calendar
          </Button>
        </Link>
        <Link to="/admin/availability">
          <Button variant="outline" size="sm">
            Availability
          </Button>
        </Link>
      </nav>

      <Card className="mt-6">
        <h2 className="font-semibold">Filter appointments</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="date"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={filter.date}
            onChange={(e) => setFilter((f) => ({ ...f, date: e.target.value }))}
            aria-label="Filter by date"
          />
          <input
            type="text"
            placeholder="Customer name"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={filter.customer}
            onChange={(e) => setFilter((f) => ({ ...f, customer: e.target.value }))}
          />
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      <div className="mt-6 space-y-3">
        <h2 className="font-semibold">Appointments</h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No appointments match your filters.</p>
        ) : (
          filtered.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{a.customer?.name}</p>
                  <p className="text-sm text-slate-600">
                    {a.service?.name} · {format(parseISO(a.appointment_date), 'MMM d, yyyy')} · {a.appointment_time}
                  </p>
                  <p className="text-xs text-slate-500">#{a.confirmation_number}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(['confirmed', 'completed', 'cancelled'] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await updateAppointmentStatus(a.id, status)
                      setAppointments(await fetchAllAppointments())
                    }}
                  >
                    Mark {status}
                  </Button>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <div className="text-brand-600">{icon}</div>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </Card>
  )
}
