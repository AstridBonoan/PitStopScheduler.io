import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom,0px)+5rem)] pt-6 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
