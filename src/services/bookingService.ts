import { format, parseISO, isBefore, startOfDay } from 'date-fns'
import { DEFAULT_SERVICES } from '@/data/mockServices'
import { TIME_SLOTS, type TimeSlot, type TimeSlotValue } from '@/lib/constants'
import { generateConfirmationNumber } from '@/lib/utils'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Appointment, Service, BookingStatus } from '@/types/database'
import type { CustomerFormData, VehicleFormData } from '@/lib/validators'

export interface BookingDraft {
  serviceId: string | null
  date: string | null
  time: TimeSlotValue | null
  vehicle: VehicleFormData | null
  customer: CustomerFormData | null
}

const localAppointmentsKey = 'pss_appointments'
const localBlockedKey = 'pss_blocked_dates'
const localAvailabilityKey = 'pss_availability'

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export async function fetchServices(): Promise<Service[]> {
  if (!isSupabaseConfigured) return DEFAULT_SERVICES

  const { data, error } = await getSupabase().from('services').select('*').order('price')
  if (error || !data?.length) return DEFAULT_SERVICES
  return data
}

export async function fetchBlockedDates(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    return readLocal<string[]>(localBlockedKey, [])
  }

  const { data } = await getSupabase().from('blocked_dates').select('date')
  return data?.map((d) => d.date) ?? []
}

export async function fetchHolidays(): Promise<string[]> {
  if (!isSupabaseConfigured) return []

  const { data } = await getSupabase().from('holidays').select('date')
  return data?.map((h) => h.date) ?? []
}

export async function fetchBookedSlots(date: string): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const appointments = readLocal<Appointment[]>(localAppointmentsKey, [])
    return appointments
      .filter((a) => a.appointment_date === date && a.status !== 'cancelled')
      .map((a) => a.appointment_time)
  }

  const { data } = await getSupabase()
    .from('appointments')
    .select('appointment_time')
    .eq('appointment_date', date)
    .neq('status', 'cancelled')

  return data?.map((a) => a.appointment_time) ?? []
}

export async function getAvailableSlots(date: string): Promise<TimeSlot[]> {
  const [blocked, holidays, booked, overrides] = await Promise.all([
    fetchBlockedDates(),
    fetchHolidays(),
    fetchBookedSlots(date),
    fetchAvailabilityOverrides(date),
  ])

  if (blocked.includes(date) || holidays.includes(date)) return []

  const unavailable = new Set([...booked, ...overrides.filter((s) => !s.available).map((s) => s.time_slot)])

  return TIME_SLOTS.filter((slot) => {
    if (unavailable.has(slot.value)) return false
    const override = overrides.find((o) => o.time_slot === slot.value)
    if (override) return override.available
    return true
  })
}

async function fetchAvailabilityOverrides(date: string) {
  if (!isSupabaseConfigured) {
    const all = readLocal<{ date: string; time_slot: string; available: boolean }[]>(localAvailabilityKey, [])
    return all.filter((a) => a.date === date)
  }

  const { data } = await getSupabase().from('availability').select('*').eq('date', date)
  return data ?? []
}

export function isDateBookable(date: Date, blocked: string[], holidays: string[]): boolean {
  const today = startOfDay(new Date())
  if (isBefore(startOfDay(date), today)) return false
  const key = format(date, 'yyyy-MM-dd')
  if (blocked.includes(key) || holidays.includes(key)) return false
  return true
}

export async function createAppointment(
  draft: BookingDraft,
  service: Service,
): Promise<Appointment> {
  if (!draft.date || !draft.time || !draft.vehicle || !draft.customer) {
    throw new Error('Incomplete booking information')
  }

  const confirmationNumber = generateConfirmationNumber()

  if (!isSupabaseConfigured) {
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      customer_id: crypto.randomUUID(),
      vehicle_id: crypto.randomUUID(),
      service_id: service.id,
      appointment_date: draft.date,
      appointment_time: draft.time,
      status: 'pending',
      confirmation_number: confirmationNumber,
      notes: draft.customer.notes ?? null,
      google_calendar_event_id: null,
      service,
      customer: {
        id: crypto.randomUUID(),
        user_id: null,
        name: draft.customer.fullName,
        email: draft.customer.email,
        phone: draft.customer.phone,
      },
      vehicle: {
        id: crypto.randomUUID(),
        customer_id: '',
        make: draft.vehicle.make,
        model: draft.vehicle.model,
        year: draft.vehicle.year,
        mileage: draft.vehicle.mileage,
        license_plate: draft.vehicle.licensePlate ?? null,
      },
    }

    const existing = readLocal<Appointment[]>(localAppointmentsKey, [])
    writeLocal(localAppointmentsKey, [...existing, appointment])
    await triggerNotifications('confirm', appointment)
    return appointment
  }

  const supabase = getSupabase()

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .upsert(
      {
        name: draft.customer.fullName,
        email: draft.customer.email,
        phone: draft.customer.phone,
      },
      { onConflict: 'email' },
    )
    .select()
    .single()

  if (customerError) throw customerError

  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .insert({
      customer_id: customer.id,
      make: draft.vehicle.make,
      model: draft.vehicle.model,
      year: draft.vehicle.year,
      mileage: draft.vehicle.mileage,
      license_plate: draft.vehicle.licensePlate ?? null,
    })
    .select()
    .single()

  if (vehicleError) throw vehicleError

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      customer_id: customer.id,
      vehicle_id: vehicle.id,
      service_id: service.id,
      appointment_date: draft.date,
      appointment_time: draft.time,
      status: 'pending',
      confirmation_number: confirmationNumber,
      notes: draft.customer.notes ?? null,
    })
    .select('*, service:services(*), customer:customers(*), vehicle:vehicles(*)')
    .single()

  if (appointmentError) throw appointmentError

  await triggerNotifications('confirm', appointment as Appointment)
  return appointment as Appointment
}

export async function fetchCustomerAppointments(email: string): Promise<Appointment[]> {
  if (!isSupabaseConfigured) {
    const all = readLocal<Appointment[]>(localAppointmentsKey, [])
    return all.filter((a) => a.customer?.email === email)
  }

  const { data: customer } = await getSupabase().from('customers').select('id').eq('email', email).maybeSingle()
  if (!customer) return []

  const { data } = await getSupabase()
    .from('appointments')
    .select('*, service:services(*), customer:customers(*), vehicle:vehicles(*)')
    .eq('customer_id', customer.id)
    .order('appointment_date', { ascending: false })

  return (data as Appointment[]) ?? []
}

export async function fetchAllAppointments(): Promise<Appointment[]> {
  if (!isSupabaseConfigured) {
    return readLocal<Appointment[]>(localAppointmentsKey, [])
  }

  const { data } = await getSupabase()
    .from('appointments')
    .select('*, service:services(*), customer:customers(*), vehicle:vehicles(*)')
    .order('appointment_date', { ascending: true })

  return (data as Appointment[]) ?? []
}

export async function updateAppointmentStatus(
  id: string,
  status: BookingStatus,
  updates?: Partial<Pick<Appointment, 'appointment_date' | 'appointment_time'>>,
): Promise<void> {
  if (!isSupabaseConfigured) {
    const all = readLocal<Appointment[]>(localAppointmentsKey, [])
    const next = all.map((a) =>
      a.id === id ? { ...a, ...updates, status, updated_at: new Date().toISOString() } : a,
    )
    writeLocal(localAppointmentsKey, next)
    const updated = next.find((a) => a.id === id)
    if (updated) {
      const type = status === 'cancelled' ? 'cancel' : status === 'rescheduled' ? 'reschedule' : 'confirm'
      await triggerNotifications(type, updated)
    }
    return
  }

  const { data } = await getSupabase()
    .from('appointments')
    .update({ status, ...updates })
    .eq('id', id)
    .select('*, service:services(*), customer:customers(*), vehicle:vehicles(*)')
    .single()

  if (data) {
    const type = status === 'cancelled' ? 'cancel' : status === 'rescheduled' ? 'reschedule' : 'confirm'
    await triggerNotifications(type, data as Appointment)
  }
}

export async function blockDate(date: string, reason?: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const blocked = readLocal<string[]>(localBlockedKey, [])
    if (!blocked.includes(date)) writeLocal(localBlockedKey, [...blocked, date])
    return
  }

  await getSupabase().from('blocked_dates').upsert({ date, reason: reason ?? null })
}

export async function setSlotAvailability(
  date: string,
  timeSlot: string,
  available: boolean,
): Promise<void> {
  if (!isSupabaseConfigured) {
    const all = readLocal<{ date: string; time_slot: string; available: boolean }[]>(localAvailabilityKey, [])
    const filtered = all.filter((a) => !(a.date === date && a.time_slot === timeSlot))
    writeLocal(localAvailabilityKey, [...filtered, { date, time_slot: timeSlot, available }])
    return
  }

  await getSupabase().from('availability').upsert({ date, time_slot: timeSlot, available })
}

type NotificationType = 'confirm' | 'reminder' | 'reschedule' | 'cancel'

async function triggerNotifications(type: NotificationType, appointment: Appointment) {
  if (!isSupabaseConfigured) return

  const supabase = getSupabase()
  await supabase.functions.invoke('send-email', {
    body: { type, appointment },
  })

  await supabase.functions.invoke('sync-calendar', {
    body: { action: type === 'cancel' ? 'delete' : 'upsert', appointment },
  })
}

export function formatAppointmentDateTime(date: string, time: string) {
  const parsed = parseISO(`${date}T${time}:00`)
  return format(parsed, "EEEE, MMMM d, yyyy 'at' h:mm a")
}
