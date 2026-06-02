import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useBooking } from '@/contexts/BookingContext'
import { customerSchema, type CustomerFormData } from '@/lib/validators'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function CustomerStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { draft, setCustomer } = useBooking()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: draft.customer ?? undefined,
  })

  const onSubmit = (data: CustomerFormData) => {
    setCustomer(data)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-2xl font-bold text-slate-900">Your information</h1>
      <p className="mt-1 text-slate-500">We will send confirmations and reminders to this contact.</p>

      <div className="mt-6 space-y-4">
        <Input label="Full name" {...register('fullName')} error={errors.fullName?.message} autoComplete="name" />
        <Input
          label="Phone number"
          type="tel"
          inputMode="tel"
          {...register('phone')}
          error={errors.phone?.message}
          autoComplete="tel"
        />
        <Input
          label="Email address"
          type="email"
          inputMode="email"
          {...register('email')}
          error={errors.email?.message}
          autoComplete="email"
        />
        <div className="space-y-1.5">
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
            Vehicle concerns / notes (optional)
          </label>
          <textarea
            id="notes"
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="Describe any symptoms or requests…"
            {...register('notes')}
          />
          {errors.notes?.message ? (
            <p className="text-sm text-red-600" role="alert">
              {errors.notes.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="sticky bottom-20 mt-8 flex gap-3 md:bottom-4">
        <Button type="button" variant="outline" className="flex-1" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1" size="lg">
          Review booking
        </Button>
      </div>
    </form>
  )
}
