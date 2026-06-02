export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'rescheduled' | 'cancelled'

export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  created_at?: string
}

export interface Customer {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string
  created_at?: string
}

export interface Vehicle {
  id: string
  customer_id: string
  make: string
  model: string
  year: number
  mileage: number
  license_plate: string | null
  created_at?: string
}

export interface Appointment {
  id: string
  customer_id: string
  vehicle_id: string
  service_id: string
  appointment_date: string
  appointment_time: string
  status: BookingStatus
  confirmation_number: string
  notes: string | null
  google_calendar_event_id: string | null
  created_at?: string
  updated_at?: string
  customer?: Customer
  vehicle?: Vehicle
  service?: Service
}

export interface AvailabilitySlot {
  id: string
  date: string
  time_slot: string
  available: boolean
}

export interface BlockedDate {
  id: string
  date: string
  reason: string | null
}

export interface Holiday {
  id: string
  date: string
  name: string
}

export interface BusinessHours {
  id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
}

export interface Database {
  public: {
    Tables: {
      services: { Row: Service; Insert: Omit<Service, 'id'> & { id?: string }; Update: Partial<Service> }
      customers: { Row: Customer; Insert: Omit<Customer, 'id'> & { id?: string }; Update: Partial<Customer> }
      vehicles: { Row: Vehicle; Insert: Omit<Vehicle, 'id'> & { id?: string }; Update: Partial<Vehicle> }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'google_calendar_event_id'> & {
          id?: string
          google_calendar_event_id?: string | null
        }
        Update: Partial<Appointment>
      }
      availability: {
        Row: AvailabilitySlot
        Insert: Omit<AvailabilitySlot, 'id'> & { id?: string }
        Update: Partial<AvailabilitySlot>
      }
      blocked_dates: { Row: BlockedDate; Insert: Omit<BlockedDate, 'id'> & { id?: string }; Update: Partial<BlockedDate> }
      holidays: { Row: Holiday; Insert: Omit<Holiday, 'id'> & { id?: string }; Update: Partial<Holiday> }
      business_hours: {
        Row: BusinessHours
        Insert: Omit<BusinessHours, 'id'> & { id?: string }
        Update: Partial<BusinessHours>
      }
      profiles: {
        Row: { id: string; role: 'admin' | 'customer'; full_name: string | null }
        Insert: { id: string; role?: 'admin' | 'customer'; full_name?: string | null }
        Update: Partial<{ role: 'admin' | 'customer'; full_name: string | null }>
      }
    }
  }
}
