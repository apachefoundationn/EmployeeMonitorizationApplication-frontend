import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../../components/input.jsx'
import { Button } from '../../components/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { useAuth } from '../../context/auth.jsx'
import { useToast } from '../../context/toast.jsx'
import { roles } from '../../constants/roles.js'

function redirectForRole(role) {
  if (role === roles.admin) return '/admin'
  if (role === roles.manager) return '/employee'
  return '/employee'
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const user = await login({ email, password })
      toast.push({ title: 'Signed in', message: `Welcome back, ${user.name}.`, variant: 'success' })
      navigate(redirectForRole(user.role), { replace: true })
    } catch (err) {
      setError(err?.message ?? 'Login failed.')
      toast.push({ title: 'Login failed', message: err?.message ?? '', variant: 'danger' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={error || undefined}
          />
          <Button className="w-full" disabled={submitting} type="submit">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
          <div className="text-center text-sm text-slate-600 dark:text-slate-300">
            New here?{' '}
            <Link className="font-medium text-slate-900 hover:underline dark:text-white" to="/signup">
              Create an account
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

