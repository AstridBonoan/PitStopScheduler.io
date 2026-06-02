import { NavLink } from 'react-router-dom'
import { Calendar, Home, User, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/book', icon: Wrench, label: 'Book' },
  { to: '/account', icon: User, label: 'Account' },
  { to: '/admin', icon: Calendar, label: 'Admin' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur safe-bottom md:hidden"
      aria-label="Main navigation"
    >
      <ul className="flex items-stretch justify-around px-2 py-2">
        {links.map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium transition-colors',
                  isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-800',
                )
              }
            >
              <Icon className="size-5" aria-hidden />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
