import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { BookingDraft } from '@/services/bookingService'
import type { TimeSlotValue } from '@/lib/constants'
import type { CustomerFormData, VehicleFormData } from '@/lib/validators'

interface BookingContextValue {
  draft: BookingDraft
  step: number
  setStep: (step: number) => void
  selectService: (serviceId: string) => void
  selectDate: (date: string) => void
  selectTime: (time: TimeSlotValue) => void
  setVehicle: (vehicle: VehicleFormData) => void
  setCustomer: (customer: CustomerFormData) => void
  reset: () => void
}

const initialDraft: BookingDraft = {
  serviceId: null,
  date: null,
  time: null,
  vehicle: null,
  customer: null,
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(initialDraft)
  const [step, setStep] = useState(0)

  const value = useMemo<BookingContextValue>(
    () => ({
      draft,
      step,
      setStep,
      selectService: (serviceId) => setDraft((d) => ({ ...d, serviceId })),
      selectDate: (date) => setDraft((d) => ({ ...d, date, time: null })),
      selectTime: (time) => setDraft((d) => ({ ...d, time })),
      setVehicle: (vehicle) => setDraft((d) => ({ ...d, vehicle })),
      setCustomer: (customer) => setDraft((d) => ({ ...d, customer })),
      reset: () => {
        setDraft(initialDraft)
        setStep(0)
      },
    }),
    [draft, step],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}
