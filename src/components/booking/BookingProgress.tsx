const STEPS = ['Service', 'Date', 'Time', 'Vehicle', 'Contact', 'Review', 'Done']

export function BookingProgress({ current }: { current: number }) {
  return (
    <div className="mb-6" aria-label={`Booking step ${current + 1} of ${STEPS.length}`}>
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span>
          Step {current + 1} of {STEPS.length}
        </span>
        <span>{STEPS[current]}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={current + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
        />
      </div>
    </div>
  )
}
