import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card.jsx'
import { Input } from '../../components/input.jsx'
import { Button } from '../../components/button.jsx'
import { api } from '../../utils/api.js'
import { useToast } from '../../context/toast.jsx'

export function SignupPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await api.register({ name, email, password })
      toast.push({ title: 'Account created', message: 'You can now sign in.', variant: 'success' })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err?.message ?? 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          {error ? <div className="text-xs text-rose-600 dark:text-rose-400">{error}</div> : null}
          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
          <div className="text-center text-sm text-slate-600 dark:text-slate-300">
            Already have an account?{' '}
            <Link className="font-medium text-slate-900 hover:underline dark:text-white" to="/login">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

