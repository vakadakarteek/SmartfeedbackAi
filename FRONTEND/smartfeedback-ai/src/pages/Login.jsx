import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquareText, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!form.email)    e.email    = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password) e.password = 'Password is required.'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Logged in successfully.')
      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  function handle(field) {
    return (ev) => {
      setForm((p) => ({ ...p, [field]: ev.target.value }))
      if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 bg-brand-600 p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <MessageSquareText size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white">SmartFeedback AI</span>
        </div>

        <div>
          <p className="text-brand-200 text-sm mb-3 font-medium uppercase tracking-wide">Generate. Review. Share.</p>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your feedback workflow,<br />simplified.
          </h2>
          <p className="text-brand-200 text-sm leading-relaxed">
            Generate AI-assisted feedback drafts, review them before sharing, and reach your contacts through the right channel.
          </p>
        </div>

        <div className="space-y-3">
          {[
            'AI-generated drafts you control',
            'Review and edit before sending',
            'SMS, Email, and WhatsApp support',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-brand-100 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center">
              <MessageSquareText size={14} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">
              SmartFeedback <span className="text-brand-600">AI</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-8">
            Sign in to your account to continue.
          </p>

          {/* Demo hint */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-xs text-amber-700 font-medium mb-0.5">Demo credentials</p>
            <p className="text-xs text-amber-600">Email: arjun@example.com &nbsp;·&nbsp; Password: any 3+ chars</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Global error */}
            {errors.form && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
                <p className="text-sm text-red-600">{errors.form}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handle('email')}
                  className={`input-base pl-9 ${errors.email ? 'input-error' : ''}`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && <p id="email-error" className="mt-1.5 text-xs text-red-600" role="alert">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handle('password')}
                  className={`input-base pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="mt-1.5 text-xs text-red-600" role="alert">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
