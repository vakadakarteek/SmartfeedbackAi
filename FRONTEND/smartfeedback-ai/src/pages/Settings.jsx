import { useState } from 'react'
import { Lock, Bell, Sliders, Shield, ChevronDown, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

function SectionTitle({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 mb-5 pb-4 border-b border-slate-100">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={16} className="text-slate-600" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function Toggle({ checked, onChange, label, desc }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div
        onClick={onChange}
        className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onChange()}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
    </label>
  )
}

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Telugu',  label: 'Telugu'  },
  { value: 'Hindi',   label: 'Hindi'   },
]
const TONE_OPTIONS = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Positive',     label: 'Positive'     },
  { value: 'Neutral',      label: 'Neutral'      },
  { value: 'Constructive', label: 'Constructive' },
  { value: 'Casual',       label: 'Casual'       },
]
const LENGTH_OPTIONS = [
  { value: 'Short',    label: 'Short'    },
  { value: 'Medium',   label: 'Medium'   },
  { value: 'Detailed', label: 'Detailed' },
]

export default function Settings() {
  const { user, logout } = useAuth()
  const { toast }        = useToast()
  const navigate         = useNavigate()

  const [notifications, setNotifications] = useState({
    email: user?.preferences?.emailNotifications ?? true,
    sending: user?.preferences?.sendingNotifications ?? true,
  })
  const [preferences, setPreferences] = useState({
    language: user?.preferences?.defaultLanguage || 'English',
    tone:     user?.preferences?.defaultTone     || 'Professional',
    length:   user?.preferences?.defaultLength   || 'Medium',
  })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [pwdErrors, setPwdErrors] = useState({})
  const [savingPref, setSavingPref] = useState(false)
  const [savingPwd, setSavingPwd]   = useState(false)

  async function savePreferences() {
    setSavingPref(true)
    await new Promise(r => setTimeout(r, 600))
    setSavingPref(false)
    toast.success('Preferences saved.')
  }

  function validatePwd() {
    const e = {}
    if (!passwords.current) e.current = 'Enter your current password.'
    if (!passwords.next || passwords.next.length < 8) e.next = 'New password must be at least 8 characters.'
    if (passwords.next !== passwords.confirm) e.confirm = 'Passwords do not match.'
    return e
  }

  async function changePassword() {
    const errs = validatePwd()
    if (Object.keys(errs).length) { setPwdErrors(errs); return }
    setSavingPwd(true)
    await new Promise(r => setTimeout(r, 800))
    setSavingPwd(false)
    setPasswords({ current: '', next: '', confirm: '' })
    setPwdErrors({})
    toast.success('Password changed successfully.')
  }

  function logoutAll() {
    logout()
    toast.info('Logged out from all devices.')
    navigate('/login')
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="mb-2">
        <h1 className="page-title">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account, notifications, and preferences.</p>
      </div>

      {/* Account */}
      <div className="card p-6">
        <SectionTitle icon={Shield} title="Account" desc="Your registered account information." />
        <div className="space-y-3">
          {[
            { label: 'Name',  value: user?.name  },
            { label: 'Email', value: user?.email },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500">{f.label}</span>
              <span className="text-sm font-medium text-slate-900">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <SectionTitle icon={Bell} title="Notifications" desc="Control which notifications you receive." />
        <div>
          <Toggle
            checked={notifications.email}
            onChange={() => setNotifications(p => ({ ...p, email: !p.email }))}
            label="Email notifications"
            desc="Receive updates and activity summaries by email."
          />
          <Toggle
            checked={notifications.sending}
            onChange={() => setNotifications(p => ({ ...p, sending: !p.sending }))}
            label="Sending completion notifications"
            desc="Get notified when a feedback send is complete."
          />
        </div>
        <button onClick={savePreferences} disabled={savingPref} className="btn-secondary gap-2 mt-4 text-sm">
          {savingPref ? <><span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />Saving…</> : <><Check size={14} />Save</>}
        </button>
      </div>

      {/* Preferences */}
      <div className="card p-6">
        <SectionTitle icon={Sliders} title="Preferences" desc="Set defaults for feedback generation." />
        <div className="space-y-4">
          {[
            { label: 'Default language', key: 'language', options: LANGUAGE_OPTIONS },
            { label: 'Default tone',     key: 'tone',     options: TONE_OPTIONS     },
            { label: 'Default length',   key: 'length',   options: LENGTH_OPTIONS   },
          ].map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <div className="relative">
                <select value={preferences[f.key]}
                  onChange={e => setPreferences(p => ({ ...p, [f.key]: e.target.value }))}
                  className="input-base appearance-none pr-9 text-sm">
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          ))}
          <button onClick={savePreferences} disabled={savingPref} className="btn-secondary gap-2 text-sm">
            {savingPref ? <><span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />Saving…</> : <><Check size={14} />Save Preferences</>}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="card p-6">
        <SectionTitle icon={Lock} title="Security" desc="Manage your password and sessions." />
        <div className="space-y-4 mb-5">
          {[
            { key: 'current', label: 'Current password', placeholder: 'Enter current password' },
            { key: 'next',    label: 'New password',     placeholder: 'At least 8 characters'  },
            { key: 'confirm', label: 'Confirm password', placeholder: 'Repeat new password'    },
          ].map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input type="password" value={passwords[f.key]}
                onChange={e => { setPasswords(p => ({ ...p, [f.key]: e.target.value })); setPwdErrors(p => ({ ...p, [f.key]: undefined })) }}
                className={`input-base ${pwdErrors[f.key] ? 'input-error' : ''}`} placeholder={f.placeholder} />
              {pwdErrors[f.key] && <p className="mt-1 text-xs text-red-600">{pwdErrors[f.key]}</p>}
            </div>
          ))}
          <button onClick={changePassword} disabled={savingPwd} className="btn-secondary gap-2 text-sm">
            {savingPwd ? <><span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />Saving…</> : <><Lock size={14} />Change Password</>}
          </button>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-800 mb-1">Active sessions</p>
          <p className="text-xs text-slate-500 mb-3">This will sign you out from all devices, including this one.</p>
          <button onClick={logoutAll} className="btn-danger gap-2 text-sm">
            Logout from All Devices
          </button>
        </div>
      </div>
    </div>
  )
}
