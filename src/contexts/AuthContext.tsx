import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

type UserRole = 'admin' | 'customer' | null

interface AuthContextValue {
  user: User | null
  session: Session | null
  role: UserRole
  loading: boolean
  isAdmin: boolean
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>
  signInAdmin: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  const loadRole = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      const mockRole = localStorage.getItem('pss_mock_role') as UserRole
      setRole(mockRole ?? 'customer')
      return
    }

    const { data } = await getSupabase()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    const profile = data as { role?: UserRole } | null
    setRole(profile?.role ?? 'customer')
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const mockEmail = localStorage.getItem('pss_mock_email')
      if (mockEmail) setRole((localStorage.getItem('pss_mock_role') as UserRole) ?? 'customer')
      setLoading(false)
      return
    }

    const supabase = getSupabase()

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session?.user) void loadRole(data.session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) void loadRole(nextSession.user.id)
      else setRole(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [loadRole])

  const signInWithMagicLink = async (email: string) => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('pss_mock_email', email)
      localStorage.setItem('pss_mock_role', 'customer')
      setRole('customer')
      return { error: null }
    }

    const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}account`
    const { error } = await getSupabase().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    return { error: error?.message ?? null }
  }

  const signInAdmin = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      if (email.includes('admin')) {
        localStorage.setItem('pss_mock_email', email)
        localStorage.setItem('pss_mock_role', 'admin')
        setRole('admin')
        return { error: null }
      }
      return { error: 'Use an email containing "admin" for demo admin login without Supabase.' }
    }

    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }

    const { data: profileRow } = await getSupabase()
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    const profile = profileRow as { role?: UserRole } | null
    if (profile?.role !== 'admin') {
      await getSupabase().auth.signOut()
      return { error: 'This account does not have admin access.' }
    }

    setRole('admin')
    return { error: null }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('pss_mock_email')
      localStorage.removeItem('pss_mock_role')
      setRole(null)
      return
    }
    await getSupabase().auth.signOut()
    setRole(null)
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      role,
      loading,
      isAdmin: role === 'admin',
      signInWithMagicLink,
      signInAdmin,
      signOut,
    }),
    [session, role, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
