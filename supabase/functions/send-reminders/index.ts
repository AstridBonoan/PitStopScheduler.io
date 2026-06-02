import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

/**
 * Scheduled function (cron) to send 24h and 2h reminder emails via send-email.
 * Configure in Supabase Dashboard: Edge Functions → send-reminders → Cron
 * e.g. every hour: 0 * * * *
 *
 * SMS-ready: set sms_reminder_sent when Twilio integration is added.
 */
Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, service:services(*), customer:customers(*), vehicle:vehicles(*)')
    .in('status', ['pending', 'confirmed'])

  for (const appointment of appointments ?? []) {
    const apptStart = new Date(`${appointment.appointment_date}T${appointment.appointment_time}:00`)
    const diffHours = (apptStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    if ((diffHours > 23 && diffHours <= 25) || (diffHours > 1.5 && diffHours <= 2.5)) {
      await supabase.functions.invoke('send-email', {
        body: { type: 'reminder', appointment },
      })
    }
  }

  return new Response(JSON.stringify({ ok: true, checked: appointments?.length ?? 0 }))
})
