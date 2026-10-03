import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquareText, Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number',      pass: /\d/.test(password) },
    { label: 'Contains a letter',      pass: /[a-zA-Z]/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-2">
          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${c.pass ? 'bg-green-100' : 'bg-slate-100'}`}>
            <span className={`text-2xs font-bold ${c.pass ? 'text-green-600' : 'text-slate-400'}`}>
              {c.pass ? '✓' : '·'}
            </span>
          </span>
          <span className={`text-xs ${c.pass ? 'text-green-700' : 'text-slate-400'}`}>{c.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', terms: false,
  })
  const [errors, setErrors]   = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [showCPwd, setShowCPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!form.name.trim())       e.name    = 'Full name is required.'
    if (!form.email)             e.email   = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password)          e.password = 'Password is required.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (!form.confirmPassword)   e.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.'
    if (!form.terms)             e.terms   = 'You must accept the terms to continue.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      toast.success('Account created! Welcome to SmartFeedback AI.')
      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  function handle(field) {
    return (ev) => {
      const val = field === 'terms' ? ev.target.checked : ev.target.value
      setForm((p) => ({ ...p, [field]: val }))
      if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center">
            <MessageSquareText size={14} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">
            SmartFeedback <span className="text-brand-600">AI</span>
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 mb-7">
            Start generating and sharing feedback today.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {errors.form && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
                <p className="text-sm text-red-600">{errors.form}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="label">Full name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Arjun Mehta"
                  value={form.name}
                  onChange={handle('name')}
                  className={`input-base pl-9 ${errors.name ? 'input-error' : ''}`}
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="label">Email address <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handle('email')}
                  className={`input-base pl-9 ${errors.email ? 'input-error' : ''}`}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="label">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handle('password')}
                  className={`input-base pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password
                ? <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.password}</p>
                : <PasswordStrength password={form.password} />
              }
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="label">Confirm password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="confirm-password"
                  type={showCPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handle('confirmPassword')}
                  className={`input-base pl-9 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showCPwd ? 'Hide password' : 'Show password'}
                >
                  {showCPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={handle('terms')}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                  aria-invalid={!!errors.terms}
                />
                <span className="text-sm text-slate-600">
                  I agree to the{' '}
                  <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-brand-600 hover:text-brand-700 font-medium">Privacy Policy</a>
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-xs text-red-600" role="alert">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
