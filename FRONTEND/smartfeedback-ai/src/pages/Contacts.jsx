import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserPlus, Upload, Search, Edit2, Trash2, Phone,
  Mail, Users, CheckSquare, Square, X, Tag
} from 'lucide-react'
import { contactService } from '../services/contactService'
import { useToast } from '../context/ToastContext'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import { SkeletonTable } from '../components/common/Skeleton'
import { validateContactRow } from '../utils/validators'
import { maskPhone, formatDate } from '../utils/formatters'

// ─── Tag badge color map ──────────────────────────────────────────────────
const TAG_COLORS = {
  College: 'blue', Students: 'blue', Faculty: 'green',
  Customers: 'orange', Team: 'slate', Workshop: 'blue',
}
function tagVariant(tag) { return TAG_COLORS[tag] || 'slate' }

// ─── Edit Contact Modal ───────────────────────────────────────────────────
function EditContactModal({ contact, onSave, onClose }) {
  const [form, setForm] = useState({ name: contact.name, phone: contact.phone, email: contact.email, tags: contact.tags || [] })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const [tagInput, setTagInput] = useState('')

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    const hasPhone = form.phone && /\d{10}/.test(form.phone.replace(/\D/g, ''))
    const hasEmail = form.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    if (!hasPhone && !hasEmail) e.contact = 'Provide a valid phone number or email address.'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await onSave(contact.id, form)
      toast.success('Contact updated.')
      onClose()
    } catch { toast.error('Failed to save contact.') }
    finally { setSaving(false) }
  }

  function addTag(t) {
    const clean = t.trim()
    if (clean && !form.tags.includes(clean)) setForm(p => ({ ...p, tags: [...p.tags, clean] }))
    setTagInput('')
  }
  function removeTag(t) { setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) })) }

  return (
    <Modal open title="Edit Contact" onClose={onClose} size="sm"
      footer={<>
        <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </>}
    >
      <div className="space-y-4">
        {errors.contact && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.contact}</p>}
        <div>
          <label className="label">Full name <span className="text-red-500">*</span></label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={`input-base ${errors.name ? 'input-error' : ''}`} placeholder="Rahul Kumar" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="label">Phone number</label>
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-base" placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="label">Email address</label>
          <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-base" type="email" placeholder="rahul@example.com" />
        </div>
        <div>
          <label className="label">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs text-brand-700">
                {tag} <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
          <input value={tagInput} onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) { e.preventDefault(); addTag(tagInput) } }}
            className="input-base text-sm" placeholder="Type a tag and press Enter" />
        </div>
      </div>
    </Modal>
  )
}

// ─── CSV Import Modal ─────────────────────────────────────────────────────
function CSVImportModal({ onClose, onImport }) {
  const [step, setStep] = useState(1) // 1=upload 2=preview 3=done
  const [rows, setRows] = useState([])
  const [valid, setValid] = useState([])
  const [invalid, setInvalid] = useState([])
  const [importing, setImporting] = useState(false)
  const fileRef = useRef()
  const { toast } = useToast()

  function parseCSV(text) {
    const lines = text.trim().split('\n').filter(Boolean)
    // Detect header row
    const firstLine = lines[0].toLowerCase()
    const hasHeader = firstLine.includes('name') || firstLine.includes('phone') || firstLine.includes('email')
    const dataLines = hasHeader ? lines.slice(1) : lines
    return dataLines.map(line => {
      const cols = line.split(',').map(c => c.replace(/"/g, '').trim())
      return { name: cols[0] || '', phone: cols[1] || '', email: cols[2] || '', tags: cols[3] ? cols[3].split(';') : [] }
    })
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result)
      setRows(parsed)
      const v = [], inv = []
      parsed.forEach(r => {
        const res = validateContactRow(r)
        res.valid ? v.push(r) : inv.push({ ...r, reason: res.reason })
      })
      setValid(v); setInvalid(inv)
      setStep(2)
    }
    reader.readAsText(file)
  }

  async function handleImport() {
    setImporting(true)
    try {
      await onImport(valid)
      setStep(3)
    } catch { toast.error('Import failed.') }
    finally { setImporting(false) }
  }

  return (
    <Modal open title="Import Contacts from CSV" onClose={onClose} size="md"
      footer={
        step === 2 ? <>
          <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
          <button className="btn-primary" onClick={handleImport} disabled={importing || valid.length === 0}>
            {importing ? 'Importing…' : `Import ${valid.length} contacts`}
          </button>
        </> : step === 3 ? <button className="btn-primary" onClick={onClose}>Done</button> : null
      }
    >
      {step === 1 && (
        <div>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center mb-4 hover:border-brand-300 transition-colors">
            <Upload size={28} className="text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700 mb-1">Upload a CSV file</p>
            <p className="text-xs text-slate-400 mb-4">Columns: Name, Phone, Email, Tags (optional)</p>
            <button onClick={() => fileRef.current.click()} className="btn-secondary text-sm">Choose File</button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-1">Expected format</p>
            <code className="text-xs text-slate-500 font-mono">Name,Phone,Email,Tags</code><br />
            <code className="text-xs text-slate-500 font-mono">Rahul Kumar,+91 98765 41234,rahul@example.com,Students;Workshop</code>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="badge-green">{valid.length} contacts ready</span>
            {invalid.length > 0 && <span className="badge-red">{invalid.length} invalid</span>}
          </div>
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0"><tr>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Name</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Phone</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Email</th>
                <th className="text-left px-3 py-2 text-slate-500 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const isInvalid = invalid.find(inv => inv.name === r.name && inv.phone === r.phone)
                  return (
                    <tr key={i} className={`border-t border-slate-100 ${isInvalid ? 'bg-red-50' : ''}`}>
                      <td className="px-3 py-2 text-slate-800">{r.name || <span className="text-red-500 italic">Missing</span>}</td>
                      <td className="px-3 py-2 text-slate-600">{r.phone || '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{r.email || '—'}</td>
                      <td className="px-3 py-2">
                        {isInvalid
                          ? <span className="text-red-600">⚠ {isInvalid.reason}</span>
                          : <span className="text-green-600">✓ Valid</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {invalid.length > 0 && <p className="text-xs text-slate-500 mt-3">Invalid rows will be skipped. You can fix them in the CSV and re-import.</p>}
        </div>
      )}

      {step === 3 && (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">{valid.length} contacts imported</h3>
          <p className="text-sm text-slate-500">Your contacts are ready. You can now use them when sending feedback.</p>
        </div>
      )}
    </Modal>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
const FILTERS = [
  { label: 'All',   value: 'all'   },
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' },
  { label: 'Both',  value: 'both'  },
]

export default function Contacts() {
  const { toast } = useToast()
  const navigate  = useNavigate()

  const [contacts, setContacts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [selected, setSelected]   = useState([])
  const [editContact, setEdit]    = useState(null)
  const [deleteId, setDeleteId]   = useState(null)
  const [deleting, setDeleting]   = useState(false)
  const [showCSV, setShowCSV]     = useState(false)

  useEffect(() => {
    contactService.getAll().then(setContacts).finally(() => setLoading(false))
  }, [])

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    const matchFilter =
      filter === 'all'   ? true :
      filter === 'phone' ? !!c.phone && !c.email :
      filter === 'email' ? !!c.email && !c.phone :
      filter === 'both'  ? !!c.phone && !!c.email : true
    return matchSearch && matchFilter
  })

  function toggleSelect(id) {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }
  const allSelected = selected.length === filtered.length && filtered.length > 0

  async function handleSaveEdit(id, data) {
    const updated = await contactService.update(id, data)
    setContacts(p => p.map(c => c.id === id ? { ...c, ...data } : c))
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await contactService.delete(deleteId)
      setContacts(p => p.filter(c => c.id !== deleteId))
      setSelected(p => p.filter(x => x !== deleteId))
      toast.success('Contact deleted.')
    } finally { setDeleting(false); setDeleteId(null) }
  }

  async function handleImport(rows) {
    await contactService.importCSV(rows)
    const updated = await contactService.getAll()
    setContacts(updated)
    toast.success(`${rows.length} contacts imported.`)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="mt-1 text-sm text-slate-500">{contacts.length} contact{contacts.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCSV(true)} className="btn-secondary gap-1.5 text-sm">
            <Upload size={14} /> Import CSV
          </button>
          <Link to="/contacts/add" className="btn-primary gap-1.5 text-sm">
            <UserPlus size={14} /> Add Contact
          </Link>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search contacts…"
            className="input-base pl-9"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filter === f.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Selection bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl mb-4">
          <span className="text-sm font-medium text-brand-700">{selected.length} selected</span>
          <button onClick={() => { sessionStorage.setItem('sf_send_contacts', JSON.stringify(selected)); navigate('/send') }}
            className="btn-primary text-xs px-3 py-1.5 gap-1.5 ml-auto">
            Send Feedback
          </button>
          <button onClick={() => setSelected([])} className="text-brand-600 hover:text-brand-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card p-5"><SkeletonTable rows={6} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No contacts match your search' : 'No contacts yet'}
          description={search ? 'Try a different name, phone, or email.' : 'Add contacts manually or import from a CSV file.'}
          action={!search && <Link to="/contacts/add" className="btn-primary gap-2"><UserPlus size={15} /> Add Contact</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Table head */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-center gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <button onClick={() => allSelected ? setSelected([]) : setSelected(filtered.map(c => c.id))}
              className="text-slate-400 hover:text-brand-600 transition-colors" aria-label="Select all">
              {allSelected ? <CheckSquare size={16} className="text-brand-600" /> : <Square size={16} />}
            </button>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tags</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</span>
          </div>

          {/* Rows */}
          {filtered.map(c => (
            <div key={c.id} className={`table-row px-5 py-4 grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-center gap-3 sm:gap-4 ${selected.includes(c.id) ? 'bg-brand-50/50' : ''}`}>
              {/* Checkbox */}
              <button onClick={() => toggleSelect(c.id)} className="hidden sm:block text-slate-400 hover:text-brand-600">
                {selected.includes(c.id) ? <CheckSquare size={16} className="text-brand-600" /> : <Square size={16} />}
              </button>

              {/* Name (mobile: full row) */}
              <div className="flex items-center gap-3">
                <button onClick={() => toggleSelect(c.id)} className="sm:hidden text-slate-400 hover:text-brand-600">
                  {selected.includes(c.id) ? <CheckSquare size={16} className="text-brand-600" /> : <Square size={16} />}
                </button>
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-brand-700">{c.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400 sm:hidden">{c.email || maskPhone(c.phone) || '—'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600">
                {c.phone ? <><Phone size={12} className="text-slate-400 flex-shrink-0" />{maskPhone(c.phone)}</> : <span className="text-slate-300">—</span>}
              </div>

              {/* Email */}
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-600 min-w-0">
                {c.email ? <><Mail size={12} className="text-slate-400 flex-shrink-0" /><span className="truncate">{c.email}</span></> : <span className="text-slate-300">—</span>}
              </div>

              {/* Tags */}
              <div className="hidden sm:flex flex-wrap gap-1">
                {(c.tags || []).slice(0, 2).map(tag => (
                  <Badge key={tag} variant={tagVariant(tag)}>{tag}</Badge>
                ))}
                {(c.tags || []).length > 2 && <span className="text-xs text-slate-400">+{c.tags.length - 2}</span>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button onClick={() => setEdit(c)} className="btn-ghost p-2" aria-label="Edit contact">
                  <Edit2 size={14} className="text-slate-500" />
                </button>
                <button onClick={() => setDeleteId(c.id)} className="btn-ghost p-2 hover:bg-red-50" aria-label="Delete contact">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {editContact && <EditContactModal contact={editContact} onSave={handleSaveEdit} onClose={() => setEdit(null)} />}
      {showCSV && <CSVImportModal onClose={() => setShowCSV(false)} onImport={handleImport} />}
      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete}
        loading={deleting} title="Delete contact?" danger
        message="This contact will be permanently removed and cannot be recovered."
        confirmLabel="Delete"
      />
    </div>
  )
}
