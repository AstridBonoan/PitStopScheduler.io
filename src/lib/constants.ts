export const APP_NAME = 'Pit Stop Scheduler'

export const TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
] as const

export type TimeSlot = (typeof TIME_SLOTS)[number]
export type TimeSlotValue = TimeSlot['value']

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'rescheduled',
  'cancelled',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const DEFAULT_BUSINESS_HOURS = {
  monday: { open: '09:00', close: '16:00', closed: false },
  tuesday: { open: '09:00', close: '16:00', closed: false },
  wednesday: { open: '09:00', close: '16:00', closed: false },
  thursday: { open: '09:00', close: '16:00', closed: false },
  friday: { open: '09:00', close: '16:00', closed: false },
  saturday: { open: '09:00', close: '13:00', closed: false },
  sunday: { open: '09:00', close: '13:00', closed: true },
} as const

export const SHOP_CONTACT = {
  phone: '(555) 123-4567',
  email: 'service@pitstopscheduler.com',
  address: '123 Auto Lane, Motor City, MC 12345',
}
