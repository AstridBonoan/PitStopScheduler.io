/**
 * SMS-ready architecture for future Twilio integration.
 * Wire TWILIO_* secrets and call from send-reminders edge function.
 */
export interface SmsPayload {
  to: string
  body: string
  appointmentId: string
}

export async function sendSmsReminder(_payload: SmsPayload): Promise<{ ok: boolean; mock: true }> {
  // TODO: Twilio Client.messages.create when credentials are configured
  return { ok: true, mock: true }
}
