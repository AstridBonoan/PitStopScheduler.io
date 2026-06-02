import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { adminLoginSchema } from '@/lib/validators'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export function AdminLoginPage() {
  const { signInAdmin, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(adminLoginSchema),
  })

  useEffect(() => {
    if (isAdmin) navigate('/admin/dashboard', { replace: true })
  }, [isAdmin, navigate])

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-slate-900">Admin sign in</h1>
      <p className="mt-1 text-slate-500">Secure access for shop owners and managers.</p>

      <Card className="mt-6">
        <form
          onSubmit={handleSubmit(async (data) => {
            setLoading(true)
            setError(null)
            const result = await signInAdmin(data.email, data.password)
            setLoading(false)
            if (result.error) setError(result.error)
            else navigate('/admin/dashboard')
          })}
          className="space-y-4"
        >
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          Demo without Supabase: use an email containing &quot;admin&quot; and any password (8+ chars).
        </p>
      </Card>
    </div>
  )
}
