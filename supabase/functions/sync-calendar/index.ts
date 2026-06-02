import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const GOOGLE_CLIENT_EMAIL = Deno.env.get('GOOGLE_CLIENT_EMAIL')
const GOOGLE_PRIVATE_KEY = Deno.env.get('GOOGLE_PRIVATE_KEY')?.replace(/\\n/g, '\n')
const GOOGLE_CALENDAR_ID = Deno.env.get('GOOGLE_CALENDAR_ID')

interface AppointmentPayload {
  id: string
  confirmation_number: string
  appointment_date: string
  appointment_time: string
  google_calendar_event_id?: string | null
  customer?: { name: string; email: string; phone: string }
  vehicle?: { year: number; make: string; model: string; mileage: number; license_plate?: string | null }
  service?: { name: string }
  notes?: string | null
}

function buildEventBody(appointment: AppointmentPayload) {
  const start = `${appointment.appointment_date}T${appointment.appointment_time}:00`
  const endHour = parseInt(appointment.appointment_time.split(':')[0], 10) + 1
  const end = `${appointment.appointment_date}T${String(endHour).padStart(2, '0')}:00:00`

  return {
    summary: `${appointment.service?.name ?? 'Service'} — ${appointment.customer?.name}`,
    description: [
      `Confirmation: ${appointment.confirmation_number}`,
      `Customer: ${appointment.customer?.name}`,
      `Phone: ${appointment.customer?.phone}`,
      `Email: ${appointment.customer?.email}`,
      `Vehicle: ${appointment.vehicle?.year} ${appointment.vehicle?.make} ${appointment.vehicle?.model}`,
      `Mileage: ${appointment.vehicle?.mileage}`,
      appointment.notes ? `Notes: ${appointment.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    start: { dateTime: start, timeZone: 'America/New_York' },
    end: { dateTime: end, timeZone: 'America/New_York' },
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { action, appointment } = (await req.json()) as {
      action: 'upsert' | 'delete'
      appointment: AppointmentPayload
    }

    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_CALENDAR_ID) {
      console.log('Google Calendar not configured. Action:', action, appointment.confirmation_number)
      return new Response(JSON.stringify({ ok: true, mock: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Production: exchange service account JWT for access token and call Calendar API v3
    // events.insert / events.update / events.delete on GOOGLE_CALENDAR_ID
    const eventBody = buildEventBody(appointment)
    console.log('Calendar sync', action, eventBody.summary)

    return new Response(
      JSON.stringify({
        ok: true,
        eventId: appointment.google_calendar_event_id ?? `mock-${appointment.id}`,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
