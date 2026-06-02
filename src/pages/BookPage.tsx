import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookingProvider, useBooking } from '@/contexts/BookingContext'
import { BookingProgress } from '@/components/booking/BookingProgress'
import { ServiceStep } from '@/components/booking/ServiceStep'
import { DateStep } from '@/components/booking/DateStep'
import { TimeStep } from '@/components/booking/TimeStep'
import { VehicleStep } from '@/components/booking/VehicleStep'
import { CustomerStep } from '@/components/booking/CustomerStep'
import { ReviewStep } from '@/components/booking/ReviewStep'
import { ConfirmationStep } from '@/components/booking/ConfirmationStep'

function BookWizard() {
  const { step, setStep, reset } = useBooking()
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null)

  const go = (next: number) => setStep(next)

  if (confirmationNumber) {
    return <ConfirmationStep confirmationNumber={confirmationNumber} />
  }

  return (
    <div
      className="flex max-md:max-h-[var(--booking-panel-height)] max-md:min-h-[var(--booking-panel-height)] flex-col md:min-h-0 md:max-h-none"
    >
      <BookingProgress current={step} />
      <div className="flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
          {step === 0 && <ServiceStep onNext={() => go(1)} />}
          {step === 1 && <DateStep onBack={() => go(0)} onNext={() => go(2)} />}
          {step === 2 && <TimeStep onBack={() => go(1)} onNext={() => go(3)} />}
          {step === 3 && <VehicleStep onBack={() => go(2)} onNext={() => go(4)} />}
          {step === 4 && <CustomerStep onBack={() => go(3)} onNext={() => go(5)} />}
          {step === 5 && (
            <ReviewStep
              onBack={() => go(4)}
              onSuccess={(num) => {
                setConfirmationNumber(num)
                reset()
              }}
            />
          )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function BookPage() {
  return (
    <BookingProvider>
      <BookWizard />
    </BookingProvider>
  )
}
