import { motion } from 'framer-motion'
import { Clock, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Service } from '@/types/database'
import { fetchServices } from '@/services/bookingService'
import { useBooking } from '@/contexts/BookingContext'
import { formatCurrency, cn } from '@/lib/utils'
import { BookingStickyActions } from '@/components/booking/BookingStickyActions'
import { Button } from '@/components/ui/Button'

export function ServiceStep({ onNext }: { onNext: () => void }) {
  const { draft, selectService } = useBooking()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices().then(setServices).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Select a service</h1>
      <p className="mt-1 text-slate-500">Choose the service your vehicle needs today.</p>

      <div className="mt-6 space-y-3" role="list">
        {loading ? (
          <p className="text-sm text-slate-500">Loading services…</p>
        ) : (
          services.map((service, index) => (
            <motion.button
              key={service.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => selectService(service.id)}
              className={cn(
                'w-full rounded-2xl border p-5 text-left transition-all',
                draft.serviceId === service.id
                  ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              )}
              role="listitem"
              aria-pressed={draft.serviceId === service.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{service.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-4" aria-hidden />
                      {service.duration} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="size-4" aria-hidden />
                      From {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>

      <BookingStickyActions>
        <Button className="w-full" size="lg" solidDisabled disabled={!draft.serviceId} onClick={onNext}>
          Continue
        </Button>
      </BookingStickyActions>
    </div>
  )
}
