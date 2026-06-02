import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useBooking } from '@/contexts/BookingContext'
import { vehicleSchema, type VehicleFormData } from '@/lib/validators'
import { Input } from '@/components/ui/Input'
import { BookingStepShell } from '@/components/booking/BookingStepShell'
import { BookingStickyActions } from '@/components/booking/BookingStickyActions'
import { Button } from '@/components/ui/Button'

export function VehicleStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { draft, setVehicle } = useBooking()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema) as never,
    defaultValues: draft.vehicle ?? undefined,
  })

  const onSubmit = (data: VehicleFormData) => {
    setVehicle(data)
    onNext()
  }

  return (
    <BookingStepShell
      actions={
        <BookingStickyActions className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" size="lg" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" form="vehicle-step-form" className="flex-1" size="lg" solidDisabled>
            Continue
          </Button>
        </BookingStickyActions>
      }
    >
      <form id="vehicle-step-form" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-2xl font-bold text-slate-900">Vehicle details</h1>
      <p className="mt-1 text-slate-500">Tell us about the vehicle coming in for service.</p>

      <div className="mt-6 space-y-4">
        <Input label="Make" {...register('make')} error={errors.make?.message} placeholder="Toyota" />
        <Input label="Model" {...register('model')} error={errors.model?.message} placeholder="Camry" />
        <Input
          label="Year"
          type="number"
          inputMode="numeric"
          {...register('year', { valueAsNumber: true })}
          error={errors.year?.message}
          placeholder="2020"
        />
        <Input
          label="Mileage"
          type="number"
          inputMode="numeric"
          {...register('mileage', { valueAsNumber: true })}
          error={errors.mileage?.message}
          placeholder="45000"
        />
        <Input
          label="License plate (optional)"
          {...register('licensePlate')}
          error={errors.licensePlate?.message}
          placeholder="ABC-1234"
        />
      </div>
      </form>
    </BookingStepShell>
  )
}
