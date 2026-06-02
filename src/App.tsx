import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/pages/HomePage'
import { BookPage } from '@/pages/BookPage'
import { AccountPage } from '@/pages/AccountPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminCalendarPage } from '@/pages/admin/AdminCalendarPage'
import { AdminAvailabilityPage } from '@/pages/admin/AdminAvailabilityPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="book" element={<BookPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="admin" element={<AdminLoginPage />} />
            <Route path="admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="admin/calendar" element={<AdminCalendarPage />} />
            <Route path="admin/availability" element={<AdminAvailabilityPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
