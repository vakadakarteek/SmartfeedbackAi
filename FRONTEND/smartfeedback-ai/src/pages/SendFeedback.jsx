import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ChevronRight, Check, FileText, Users, Send, Eye,
  MessageSquare, Mail, Phone, Search, CheckSquare, Square,
  AlertCircle, ArrowLeft, ArrowRight, Loader2
} from 'lucide-react'
import { contactService } from '../services/contactService'
import { feedbackService } from '../services/feedbackService'
import { messageService } from '../services/messageService'
import { useToast } from '../context/ToastContext'
import { maskPhone } from '../utils/formatters'
import EmptyState from '../components/common/EmptyState'

// ─── Step indicator ───────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: 'Select Feedback' },
  { n: 2, label: 'Select Contacts' },
  { n: 3, label: 'Choose Channel'  },
  { n: 4, label: 'Preview'         },
  { n: 5, label: 'Confirm & Send'  },
]

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center flex-shrink-0">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              s.n < current  ? 'bg-brand-600 border-brand-600 text-white' :
              s.n === current ? 'bg-white border-brand-600 text-brand-600' :
                               'bg-white border-slate-300 text-slate-400'
            }`}>
              {s.n < current ? <Check size={13} /> : s.n}
            </div>
            <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
              s.n === current ? 'text-brand-700' : s.n < current ? 'text-brand-500' : 'text-slate-400'
            }`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-10 sm:w-16 h-px mx-1 flex-shrink-0 mt-[-14px] ${s.n < current ? 'bg-brand-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1 — Select Feedback ─────────────────────────────────────────────
function StepFeedback({ selected, onSelect, onNext }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    // Try sessionStorage first
    const stored = sessionStorage.getItem('sf_generated')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSessions([parsed])
        setLoading(false)
        return
      } catch {}
    }
    feedbackService.getAll().then(setSessions).finally(() => setLoading(false))
  }, [])

  // Flatten to individual items
  const allItems = sessions.flatMap(s => s.items || [])

  if (loading) return <div className="text-center py-12"><Loader2 size={24} className="animate-spin text-brand-500 mx-auto" /></div>

  if (!allItems.length) return (
    <EmptyState icon={FileText} title="No feedback drafts yet"
      description="Generate feedback first, then come back to send it."
      action={<Link to="/generate" className="btn-primary gap-2"><Send size={15} />Generate Feedback</Link>} />
  )

  return (
    <div>
      <h2 className="section-title mb-1">Select feedback to send</h2>
      <p className="text-sm text-slate-500 mb-5">Choose one or more drafts. Recipients will each receive one randomly assigned draft.</p>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 mb-6">
        {allItems.map((item, i) => {
          const isSel = selected.includes(item.id)
          return (
            <button key={item.id} type="button" onClick={() => onSelect(item.id)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                isSel ? 'border-brand-400 bg-brand-50' : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded flex items-center justify-center border-2 transition-colors ${isSel ? 'bg-brand-600 border-brand-600' : 'border-slate-300'}`}>
                {isSel && <Check size={12} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-400">{String(i+1).padStart(2,'0')}</span>
                  {item.edited && <span className="badge-slate text-2xs">Edited</span>}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">{item.text}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-sm text-slate-500">
          {selected.length} of {allItems.length} selected
        </span>
        <button onClick={onNext} disabled={selected.length === 0} className="btn-primary gap-2">
          Next: Select Contacts <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 2 — Select Contacts ─────────────────────────────────────────────
function StepContacts({ selected, onSelect, onNext, onBack }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    contactService.getAll().then(setContacts).finally(() => setLoading(false))
  }, [])

  const filtered = contacts.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )
  const allSelected = selected.length === filtered.length && filtered.length > 0

  function toggleAll() {
    if (allSelected) onSelect([])
    else onSelect(filtered.map(c => c.id))
  }

  function toggle(id) {
    onSelect(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  if (loading) return <div className="text-center py-12"><Loader2 size={24} className="animate-spin text-brand-500 mx-auto" /></div>

  return (
    <div>
      <h2 className="section-title mb-1">Select recipients</h2>
      <p className="text-sm text-slate-500 mb-5">Choose who will receive the feedback. Phone numbers are masked for privacy.</p>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts…" className="input-base pl-9" />
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
        {/* Select all */}
        <button type="button" onClick={toggleAll}
          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors">
          {allSelected ? <CheckSquare size={16} className="text-brand-600" /> : <Square size={16} className="text-slate-400" />}
          <span className="text-sm font-medium text-slate-700">Select all ({filtered.length})</span>
        </button>

        <div className="max-h-[320px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">No contacts found.</div>
          ) : filtered.map(c => {
            const isSel = selected.includes(c.id)
            return (
              <button key={c.id} type="button" onClick={() => toggle(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 text-left transition-colors ${isSel ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSel ? 'bg-brand-600 border-brand-600' : 'border-slate-300'}`}>
                  {isSel && <Check size={10} className="text-white" />}
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-brand-700">{c.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">{maskPhone(c.phone) || c.email || '—'}</p>
                </div>
                {c.email && <Mail size={13} className="text-slate-300 flex-shrink-0" />}
                {c.phone && <Phone size={13} className="text-slate-300 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button onClick={onBack} className="btn-secondary gap-2"><ArrowLeft size={15} /> Back</button>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">{selected.length} contact{selected.length !== 1 ? 's' : ''} selected</span>
          <button onClick={onNext} disabled={selected.length === 0} className="btn-primary gap-2">
            Next: Choose Channel <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3 — Choose Channel ──────────────────────────────────────────────
const CHANNELS = [
  { id: 'SMS',      icon: Phone,        label: 'SMS',      desc: 'Send via text message to mobile numbers.',         available: true  },
  { id: 'Email',    icon: Mail,         label: 'Email',    desc: 'Send via email to registered email addresses.',    available: true  },
  { id: 'WhatsApp', icon: MessageSquare, label: 'WhatsApp', desc: 'Send via WhatsApp to mobile numbers.',           available: true  },
]

function StepChannel({ selected, onSelect, onNext, onBack }) {
  return (
    <div>
      <h2 className="section-title mb-1">Choose a channel</h2>
      <p className="text-sm text-slate-500 mb-6">Select how to deliver the feedback to your contacts.</p>

      <div className="space-y-3 mb-8">
        {CHANNELS.map(ch => (
          <button key={ch.id} type="button"
            onClick={() => ch.available && onSelect(ch.id)}
            disabled={!ch.available}
            className={`w-full flex items-center gap-5 p-5 rounded-xl border-2 text-left transition-colors ${
              !ch.available ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50' :
              selected === ch.id ? 'border-brand-500 bg-brand-50' :
              'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              selected === ch.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              <ch.icon size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{ch.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{ch.desc}</p>
              {!ch.available && <p className="text-xs text-orange-600 mt-1 flex items-center gap-1"><AlertCircle size={11} /> Not configured — contact support to enable.</p>}
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected === ch.id ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
              {selected === ch.id && <span className="w-2 h-2 rounded-full bg-white" />}
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button onClick={onBack} className="btn-secondary gap-2"><ArrowLeft size={15} /> Back</button>
        <button onClick={onNext} disabled={!selected} className="btn-primary gap-2">
          Next: Preview <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Step 4 — Preview ─────────────────────────────────────────────────────
function StepPreview({ feedbackIds, contactIds, channel, allFeedback, allContacts, onNext, onBack }) {
  const selFeedback = allFeedback.filter(f => feedbackIds.includes(f.id))
  const selContacts = allContacts.filter(c => contactIds.includes(c.id))
  const [previewIdx, setPreviewIdx] = useState(0)

  return (
    <div>
      <h2 className="section-title mb-1">Review before sending</h2>
      <p className="text-sm text-slate-500 mb-6">Review the message content and recipients. You cannot undo a send.</p>

      <div className="space-y-4 mb-6">
        {/* Message preview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message Preview</p>
            {selFeedback.length > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setPreviewIdx(i => Math.max(0, i-1))} disabled={previewIdx === 0} className="btn-ghost p-1 text-xs">‹</button>
                <span className="text-xs text-slate-500">{previewIdx+1} / {selFeedback.length}</span>
                <button onClick={() => setPreviewIdx(i => Math.min(selFeedback.length-1, i+1))} disabled={previewIdx === selFeedback.length-1} className="btn-ghost p-1 text-xs">›</button>
              </div>
            )}
          </div>
          <div className="bg-slate-50 rounded-lg px-4 py-4 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed">
              {selFeedback[previewIdx]?.text || '—'}
            </p>
          </div>
          <p className="text-xs text-amber-600 mt-2.5 flex items-center gap-1.5">
            <AlertCircle size={12} /> AI-generated draft — confirm you have reviewed this content.
          </p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Feedback drafts', value: selFeedback.length, icon: FileText },
            { label: 'Recipients',      value: selContacts.length, icon: Users    },
            { label: 'Channel',         value: channel,            icon: Send     },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center mx-auto mb-2">
                <s.icon size={15} className="text-brand-600" />
              </div>
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recipients list */}
        <div className="card p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Recipients</p>
          <div className="flex flex-wrap gap-2">
            {selContacts.slice(0,12).map(c => (
              <div key={c.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xs font-bold text-brand-700">{c.name.charAt(0)}</span>
                </div>
                <span className="text-xs text-slate-700">{c.name}</span>
              </div>
            ))}
            {selContacts.length > 12 && (
              <div className="flex items-center bg-slate-100 rounded-full px-3 py-1.5">
                <span className="text-xs text-slate-500">+{selContacts.length - 12} more</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button onClick={onBack} className="btn-secondary gap-2"><ArrowLeft size={15} /> Back</button>
        <button onClick={onNext} className="btn-primary gap-2">
          <Eye size={15} /> Review &amp; Send
        </button>
      </div>
    </div>
  )
}

// ─── Step 5 — Confirm ─────────────────────────────────────────────────────
function StepConfirm({ feedbackIds, contactIds, channel, allFeedback, allContacts, onConfirm, onBack, sending }) {
  const selFeedback = allFeedback.filter(f => feedbackIds.includes(f.id))
  const selContacts = allContacts.filter(c => contactIds.includes(c.id))

  return (
    <div>
      <h2 className="section-title mb-1">Ready to send?</h2>
      <p className="text-sm text-slate-500 mb-6">
        This will send {selFeedback.length} feedback draft{selFeedback.length !== 1 ? 's' : ''} to {selContacts.length} recipient{selContacts.length !== 1 ? 's' : ''} via {channel}.
        Please review before confirming.
      </p>

      <div className="card p-5 space-y-4 mb-6">
        {[
          { label: 'Feedback',    value: `${selFeedback.length} draft${selFeedback.length !== 1 ? 's' : ''} selected` },
          { label: 'Recipients',  value: `${selContacts.length} contact${selContacts.length !== 1 ? 's' : ''}` },
          { label: 'Channel',     value: channel },
          { label: 'Est. messages', value: `${selContacts.length} message${selContacts.length !== 1 ? 's' : ''}` },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-500">{row.label}</span>
            <span className="text-sm font-medium text-slate-900">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
        <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-700">
          You are sending AI-generated drafts. Confirm you have reviewed the content and it accurately represents feedback you want to share.
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button onClick={onBack} disabled={sending} className="btn-secondary gap-2"><ArrowLeft size={15} /> Back</button>
        <button onClick={onConfirm} disabled={sending} className="btn-primary gap-2 px-8">
          {sending
            ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
            : <><Send size={15} /> Send Feedback</>
          }
        </button>
      </div>
    </div>
  )
}

// ─── Sending Progress ─────────────────────────────────────────────────────
function SendingProgress({ progress, total }) {
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0
  return (
    <div className="text-center py-8">
      <div className="w-14 h-14 rounded-full bg-brand-50 border-2 border-brand-200 flex items-center justify-center mx-auto mb-5">
        <Loader2 size={24} className="animate-spin text-brand-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">Sending feedback…</h3>
      <p className="text-sm text-slate-500 mb-5">{progress} of {total} messages processed</p>
      <div className="max-w-xs mx-auto">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand-600 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{pct}%</p>
      </div>
    </div>
  )
}

// ─── Sending Result ───────────────────────────────────────────────────────
function SendingResult({ result, onSendMore }) {
  const navigate = useNavigate()
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
        <Check size={28} className="text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Feedback sending completed</h3>
      <p className="text-sm text-slate-500 mb-8">Here's a summary of this send.</p>

      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
        {[
          { label: 'Sent',      value: result.sent,      color: 'text-slate-900' },
          { label: 'Delivered', value: result.delivered, color: 'text-green-600' },
          { label: 'Failed',    value: result.failed,    color: result.failed > 0 ? 'text-red-500' : 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button onClick={() => navigate('/history')} className="btn-secondary gap-2">
          <Eye size={15} /> View History
        </button>
        <button onClick={onSendMore} className="btn-primary gap-2">
          <Send size={15} /> Send More
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function SendFeedback() {
  const { toast } = useToast()

  const [step, setStep]                   = useState(1)
  const [selFeedback, setSelFeedback]     = useState([])
  const [selContacts, setSelContacts]     = useState([])
  const [channel, setChannel]             = useState(null)
  const [sending, setSending]             = useState(false)
  const [progress, setProgress]           = useState(0)
  const [result, setResult]               = useState(null)
  const [allFeedback, setAllFeedback]     = useState([])
  const [allContacts, setAllContacts]     = useState([])

  // Pre-load everything needed for preview
  useEffect(() => {
    const storedFB = sessionStorage.getItem('sf_generated')
    if (storedFB) {
      try { setAllFeedback(JSON.parse(storedFB).items) } catch {}
    } else {
      feedbackService.getAll().then(sessions => setAllFeedback(sessions.flatMap(s => s.items)))
    }
    contactService.getAll().then(setAllContacts)

    // Pre-select if navigated from feedback list
    const storedSendFB = sessionStorage.getItem('sf_send_feedback')
    if (storedSendFB) {
      try {
        const items = JSON.parse(storedSendFB)
        setSelFeedback(items.map(i => i.id))
        sessionStorage.removeItem('sf_send_feedback')
      } catch {}
    }
    const storedSendC = sessionStorage.getItem('sf_send_contacts')
    if (storedSendC) {
      try {
        setSelContacts(JSON.parse(storedSendC))
        sessionStorage.removeItem('sf_send_contacts')
      } catch {}
    }
  }, [])

  function toggleFeedback(id) {
    setSelFeedback(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  async function handleSend() {
    setSending(true)
    setStep(6) // progress screen
    const total = selContacts.length

    // Simulate incremental progress
    for (let i = 0; i < total; i++) {
      await new Promise(r => setTimeout(r, 200))
      setProgress(i + 1)
    }

    try {
      const feedbackText = allFeedback.find(f => selFeedback.includes(f.id))?.text || ''
      const res = await messageService.send({
        feedbackIds: selFeedback,
        contactIds: selContacts,
        channel,
        message: feedbackText,
      })
      setResult(res)
      toast.success('Feedback sent successfully.')
    } catch (err) {
      toast.error(err.message || 'Sending failed. Please try again.')
      setStep(5)
    } finally {
      setSending(false)
    }
  }

  function reset() {
    setStep(1); setSelFeedback([]); setSelContacts([])
    setChannel(null); setResult(null); setProgress(0)
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="page-title">Send Feedback</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select feedback drafts, choose recipients and a channel, then review before sending.
        </p>
      </div>

      {step <= 5 && <StepBar current={step} />}

      <div className="card p-6">
        {step === 1 && <StepFeedback selected={selFeedback} onSelect={toggleFeedback} onNext={() => setStep(2)} />}
        {step === 2 && <StepContacts selected={selContacts} onSelect={setSelContacts} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <StepChannel selected={channel} onSelect={setChannel} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && (
          <StepPreview
            feedbackIds={selFeedback} contactIds={selContacts} channel={channel}
            allFeedback={allFeedback} allContacts={allContacts}
            onNext={() => setStep(5)} onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <StepConfirm
            feedbackIds={selFeedback} contactIds={selContacts} channel={channel}
            allFeedback={allFeedback} allContacts={allContacts}
            onConfirm={handleSend} onBack={() => setStep(4)} sending={sending}
          />
        )}
        {step === 6 && !result && <SendingProgress progress={progress} total={selContacts.length} />}
        {step === 6 && result  && <SendingResult result={result} onSendMore={reset} />}
      </div>
    </div>
  )
}
