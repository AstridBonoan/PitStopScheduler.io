import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SHOP_CONTACT } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function ConfirmationStep({ confirmationNumber }: { confirmationNumber: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="size-9" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">Your appointment has been successfully scheduled.</h1>
      <p className="mt-2 text-slate-600">
        A confirmation email has been sent with your appointment details and reminders.
      </p>

      <Card className="mt-8 text-left">
        <p className="text-sm text-slate-500">Confirmation number</p>
        <p className="mt-1 font-mono text-xl font-bold text-brand-700">{confirmationNumber}</p>
        <p className="mt-4 text-sm text-slate-600">
          Questions? Call {SHOP_CONTACT.phone} or email {SHOP_CONTACT.email}.
        </p>
      </Card>

      <div className="mt-8 flex flex-col gap-3">
        <Link to="/account">
          <Button className="w-full" size="lg">
            View my appointments
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="w-full" size="lg">
            Back to home
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
