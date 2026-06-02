import { Link } from 'react-router-dom'
import { APP_NAME } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
            PS
          </span>
          <span className="hidden sm:inline">{APP_NAME}</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Desktop navigation">
          <Link to="/book" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Book Service
          </Link>
          <Link to="/account" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            My Appointments
          </Link>
          <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Admin
          </Link>
        </nav>
        <Link to="/book" className="hidden md:block">
          <Button size="sm">Book Now</Button>
        </Link>
        <Link to="/book" className="md:hidden">
          <Button size="sm">Book</Button>
        </Link>
      </div>
    </header>
  )
}
