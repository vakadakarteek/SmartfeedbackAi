import { useState } from 'react'
import { User, Mail, Phone, Calendar, Edit2, Check, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatDate } from '../utils/formatters'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (form.phone && !/\d{10}/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid phone number.'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600)) // mock save
    updateUser({ name: form.name.trim(), phone: form.phone })
    toast.success('Profile updated.')
    setEditing(false)
    setSaving(false)
    setErrors({})
  }

  function handleCancel() {
    setForm({ name: user?.name || '', phone: user?.phone || '' })
    setEditing(false)
    setErrors({})
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="page-title">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your personal information.</p>
      </div>

      <div className="card p-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100 mb-6">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-brand-700">{initial}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            {user?.role && <span className="badge-blue mt-1 inline-block">{user.role}</span>}
          </div>
        </div>

        {/* Fields */}
        {!editing ? (
          <div className="space-y-4">
            {[
              { icon: User,     label: 'Full name',    value: user?.name  || '—' },
              { icon: Mail,     label: 'Email address', value: user?.email || '—' },
              { icon: Phone,    label: 'Phone number',  value: user?.phone || 'Not set' },
              { icon: Calendar, label: 'Member since',  value: formatDate(user?.createdAt) },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <f.icon size={15} className="text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
                  <p className="text-sm font-medium text-slate-800">{f.value}</p>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <button onClick={() => setEditing(true)} className="btn-secondary gap-2">
                <Edit2 size={14} /> Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Full name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })) }}
                className={`input-base ${errors.name ? 'input-error' : ''}`} placeholder="Your full name" />
              {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="label">Email address</label>
              <input value={user?.email} disabled className="input-base cursor-not-allowed opacity-60" />
              <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
            </div>
            <div>
              <label className="label">Phone number</label>
              <input value={form.phone} onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: undefined })) }}
                className={`input-base ${errors.phone ? 'input-error' : ''}`} placeholder="+91 98765 43210" />
              {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleCancel} disabled={saving} className="btn-secondary gap-2"><X size={14} /> Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary gap-2">
                {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><Check size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
