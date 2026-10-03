import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { contactService } from '../services/contactService'
import { useToast } from '../context/ToastContext'

const TAG_SUGGESTIONS = ['College', 'Students', 'Faculty', 'Customers', 'Team', 'Workshop', 'Management', 'Alumni']

function TagInput({ value, onChange }) {
  const [input, setInput] = useState('')
  function add(t) {
    const clean = t.trim()
    if (clean && !value.includes(clean)) onChange([...value, clean])
    setInput('')
  }
  function remove(t) { onChange(value.filter(x => x !== t)) }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs font-medium text-brand-700">
            {tag}
            <button type="button" onClick={() => remove(tag)} className="hover:text-red-600 ml-0.5" aria-label={`Remove ${tag}`}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); add(input) } }}
        placeholder="Type a tag and press Enter"
        className="input-base text-sm"
      />
      <div className="flex flex-wrap gap-1.5 mt-2">
        {TAG_SUGGESTIONS.filter(s => !value.includes(s)).map(s => (
          <button key={s} type="button" onClick={() => add(s)}
            className="px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors">
            + {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AddContact() {
  const { toast } = useToast()
  const navigate  = useNavigate()

  const [form, setForm]     = useState({ name: '', phone: '', email: '', tags: [] })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    const hasPhone = form.phone && /\d{10}/.test(form.phone.replace(/\D/g, ''))
    const hasEmail = form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    if (form.phone && !hasPhone) e.phone = 'Enter a valid phone number (at least 10 digits).'
    if (form.email && !hasEmail) e.email = 'Enter a valid email address.'
    if (!form.phone && !form.email) e.contact = 'Provide at least a phone number or email address.'
    return e
  }

  function set(field) {
    return e => {
      setForm(p => ({ ...p, [field]: e.target.value }))
      if (errors[field] || errors.contact) setErrors(p => { const n = { ...p }; delete n[field]; delete n.contact; return n })
    }
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await contactService.create(form)
      toast.success(`${form.name} added to contacts.`)
      navigate('/contacts')
    } catch (err) {
      toast.error(err.message || 'Failed to save contact.')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-lg">
      {/* Back */}
      <Link to="/contacts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft size={15} /> Back to Contacts
      </Link>

      <div className="mb-6">
        <h1 className="page-title">Add Contact</h1>
        <p className="mt-1 text-sm text-slate-500">Add a contact to send feedback drafts to.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-5">
        {errors.contact && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-600">{errors.contact}</p>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label htmlFor="c-name" className="label">Full name <span className="text-red-500">*</span></label>
          <input
            id="c-name"
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Rahul Kumar"
            className={`input-base ${errors.name ? 'input-error' : ''}`}
            autoFocus
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="c-phone" className="label">
            Phone number
            <span className="ml-1 text-slate-400 font-normal text-xs">(required if no email)</span>
          </label>
          <input
            id="c-phone"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+91 98765 43210"
            className={`input-base ${errors.phone ? 'input-error' : ''}`}
          />
          {errors.phone && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="c-email" className="label">
            Email address
            <span className="ml-1 text-slate-400 font-normal text-xs">(required if no phone)</span>
          </label>
          <input
            id="c-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="rahul@example.com"
            className={`input-base ${errors.email ? 'input-error' : ''}`}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.email}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
          <TagInput value={form.tags} onChange={tags => setForm(p => ({ ...p, tags }))} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <Link to="/contacts" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary gap-2">
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : <><UserPlus size={15} /> Save Contact</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
