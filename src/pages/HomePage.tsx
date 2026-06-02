import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Shield, Wrench, Zap } from 'lucide-react'
import { APP_NAME, SHOP_CONTACT } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const features = [
  { icon: Wrench, title: 'Expert technicians', desc: 'Certified mechanics for every make and model.' },
  { icon: Calendar, title: 'Easy scheduling', desc: 'Book in minutes from any device.' },
  { icon: Zap, title: 'Fast turnaround', desc: 'Same-week appointments with real-time slots.' },
  { icon: Shield, title: 'Trusted service', desc: 'Transparent pricing and quality guarantees.' },
]

export function HomePage() {
  return (
    <div>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-slate-900 to-brand-700 px-6 py-12 text-white"
      >
        <p className="text-sm font-medium text-brand-100">Automotive service, simplified</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{APP_NAME}</h1>
        <p className="mt-4 max-w-xl text-slate-200">
          Book oil changes, tire rotations, brake inspections, and diagnostics online. Mobile-first scheduling built
          for busy drivers.
        </p>
        <Link to="/book" className="mt-8 inline-block">
          <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100">
            Book an appointment
          </Button>
        </Link>
      </motion.section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, desc }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <Icon className="size-8 text-brand-600" aria-hidden />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
            </Card>
          </motion.div>
        ))}
      </section>

      <Card className="mt-10">
        <h2 className="font-semibold text-slate-900">Visit us</h2>
        <p className="mt-2 text-sm text-slate-600">{SHOP_CONTACT.address}</p>
        <p className="text-sm text-slate-600">{SHOP_CONTACT.phone}</p>
      </Card>
    </div>
  )
}
