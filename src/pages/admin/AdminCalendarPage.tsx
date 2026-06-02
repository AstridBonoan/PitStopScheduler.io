import { useEffect, useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { fetchAllAppointments } from '@/services/bookingService'
import type { Appointment } from '@/types/database'
import { Card, StatusBadge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

type ViewMode = 'day' | 'week' | 'month'

export function AdminCalendarPage() {
  const { isAdmin, loading } = useAuth()
  const [view, setView] = useState<ViewMode>('week')
  const [cursor, setCursor] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    fetchAllAppointments().then(setAppointments)
  }, [])

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor))
    const end = endOfWeek(endOfMonth(cursor))
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [cursor])

  if (!loading && !isAdmin) return <Navigate to="/admin" replace />

  const apptsForDay = (date: Date) =>
    appointments.filter((a) => format(parseISO(a.appointment_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
        <div className="flex gap-2" role="tablist">
          {(['day', 'week', 'month'] as const).map((v) => (
            <Button key={v} size="sm" variant={view === v ? 'primary' : 'outline'} onClick={() => setView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCursor(view === 'month' ? subMonths(cursor, 1) : view === 'week' ? subWeeks(cursor, 1) : addDays(cursor, -1))
          }
          aria-label="Previous"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-semibold">{format(cursor, 'MMMM yyyy')}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCursor(view === 'month' ? addMonths(cursor, 1) : view === 'week' ? addWeeks(cursor, 1) : addDays(cursor, 1))
          }
          aria-label="Next"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {view === 'month' && (
        <Card className="mt-6">
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const count = apptsForDay(day).length
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[64px] rounded-lg border border-slate-100 p-1 text-xs',
                    count > 0 && 'bg-brand-50',
                  )}
                >
                  <span className="font-medium">{format(day, 'd')}</span>
                  {count > 0 ? <span className="mt-1 block text-brand-600">{count} appt</span> : null}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {view === 'week' && (
        <div className="mt-6 grid gap-3 md:grid-cols-7">
          {weekDays.map((day) => (
            <Card key={day.toISOString()}>
              <p className="text-sm font-semibold">{format(day, 'EEE d')}</p>
              <div className="mt-2 space-y-2">
                {apptsForDay(day).map((a) => (
                  <div key={a.id} className="rounded-lg bg-slate-50 p-2 text-xs">
                    <p className="font-medium">{a.appointment_time}</p>
                    <p>{a.customer?.name}</p>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {view === 'day' && (
        <Card className="mt-6">
          <h2 className="font-semibold">{format(cursor, 'EEEE, MMMM d')}</h2>
          <div className="mt-4 space-y-3">
            {apptsForDay(cursor).length === 0 ? (
              <p className="text-sm text-slate-500">No appointments today.</p>
            ) : (
              apptsForDay(cursor).map((a) => (
                <div key={a.id} className="flex justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-medium">{a.customer?.name}</p>
                    <p className="text-sm text-slate-600">
                      {a.service?.name} at {a.appointment_time}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
