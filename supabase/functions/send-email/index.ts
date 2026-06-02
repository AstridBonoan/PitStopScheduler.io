import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'Pit Stop Scheduler <bookings@pitstopscheduler.com>'
const SHOP_PHONE = Deno.env.get('SHOP_PHONE') ?? '(555) 123-4567'

type EmailType = 'confirm' | 'reminder' | 'reschedule' | 'cancel'

interface AppointmentPayload {
  confirmation_number: string
  appointment_date: string
  appointment_time: string
  customer?: { name: string; email: string; phone: string }
  vehicle?: { year: number; make: string; model: string; mileage: number; license_plate?: string | null }
  service?: { name: string; price: number }
  notes?: string | null
}

function buildHtml(type: EmailType, appointment: AppointmentPayload) {
  const customer = appointment.customer
  const service = appointment.service
  const subjectMap: Record<EmailType, string> = {
    confirm: `Appointment confirmed — ${appointment.confirmation_number}`,
    reminder: `Reminder: your appointment is coming up`,
    reschedule: `Your appointment has been rescheduled`,
    cancel: `Your appointment has been cancelled`,
  }

  const introMap: Record<EmailType, string> = {
    confirm: 'Your appointment has been successfully scheduled.',
    reminder: 'This is a friendly reminder about your upcoming service appointment.',
    reschedule: 'Your appointment details have been updated.',
    cancel: 'Your appointment has been cancelled. Contact us to rebook.',
  }

  return {
    subject: subjectMap[type],
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="color:#1e40af">Pit Stop Scheduler</h1>
        <p>${introMap[type]}</p>
        <p><strong>Confirmation:</strong> ${appointment.confirmation_number}</p>
        <p><strong>Service:</strong> ${service?.name ?? 'Service'}</p>
        <p><strong>Date:</strong> ${appointment.appointment_date} at ${appointment.appointment_time}</p>
        <p><strong>Vehicle:</strong> ${appointment.vehicle?.year} ${appointment.vehicle?.make} ${appointment.vehicle?.model}</p>
        ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ''}
        <p>Questions? Call ${SHOP_PHONE}</p>
        <p style="color:#64748b;font-size:12px">SMS reminders can be enabled via Twilio in a future update.</p>
      </div>
    `,
    to: customer?.email,
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
    const { type, appointment } = (await req.json()) as { type: EmailType; appointment: AppointmentPayload }
    const { subject, html, to } = buildHtml(type, appointment)

    if (!to) {
      return new Response(JSON.stringify({ error: 'No recipient email' }), { status: 400 })
    }

    if (!RESEND_API_KEY) {
      console.log('Resend not configured. Would send:', subject, 'to', to)
      return new Response(JSON.stringify({ ok: true, mock: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    })

    const data = await res.json()
    if (!res.ok) {
      return new Response(JSON.stringify(data), { status: res.status })
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
