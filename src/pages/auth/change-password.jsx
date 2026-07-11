import { useState } from 'react'
import { api } from '../../utils/api.js'
import { useToast } from '../../context/toast.jsx'
import { Input } from '../../components/input.jsx'
import { Button } from '../../components/button.jsx'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/card.jsx'

export function ChangePasswordPage() {
  const toast = useToast()
  
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function onSendOtp() {
    setSubmitting(true)
    setError('')
    try {
      await api.sendOtp()
      setOtpSent(true)
      toast.push({ title: 'OTP Sent', message: 'Please check your email for the OTP.', variant: 'success' })
    } catch (err) {
      setError(err?.message ?? 'Failed to send OTP')
      toast.push({ title: 'Error', message: err?.message ?? 'Could not send OTP', variant: 'danger' })
    } finally {
      setSubmitting(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      setSubmitting(false)
      return
    }

    try {
      await api.changePassword({ otp, newPassword })
      toast.push({ title: 'Success', message: 'Your password has been changed successfully.', variant: 'success' })
      setOtpSent(false)
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err?.message ?? 'Failed to change password')
      toast.push({ title: 'Error', message: err?.message ?? 'Could not update password', variant: 'danger' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex w-full items-center justify-center p-4">
      <Card className="w-full max-w-lg border-none shadow-xl bg-white/60 backdrop-blur-xl dark:bg-slate-900/60 transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Change Password
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {otpSent 
              ? "Enter the OTP sent to your email and your new password." 
              : "We will send an OTP to your email to verify your identity."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {!otpSent ? (
            <div className="space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md transform transition-all duration-200 hover:-translate-y-0.5" 
                disabled={submitting} 
                onClick={onSendOtp}
              >
                {submitting ? 'Sending...' : 'Send OTP to my Email'}
              </Button>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-1">
                <Input
                  label="OTP"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                  placeholder="123456"
                />
              </div>
              <div className="space-y-1">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  error={error || undefined}
                  className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <Button 
                  variant="secondary"
                  className="w-full" 
                  disabled={submitting} 
                  onClick={() => setOtpSent(false)}
                  type="button"
                >
                  Back
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md transform transition-all duration-200 hover:-translate-y-0.5" 
                  disabled={submitting} 
                  type="submit"
                >
                  {submitting ? 'Updating...' : 'Save New Password'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
