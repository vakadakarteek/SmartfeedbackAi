import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Edit3, Copy, RefreshCw, Trash2, Send, CheckSquare,
  Square, Zap, FileText, Check, X, ChevronDown
} from 'lucide-react'
import { feedbackService } from '../services/feedbackService'
import { useToast } from '../context/ToastContext'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { SkeletonCard } from '../components/common/Skeleton'
import { timeAgo } from '../utils/formatters'

// ─── Feedback Editor Modal ────────────────────────────────────────────────
function FeedbackEditor({ item, onSave, onRegenerate, onClose }) {
  const [text, setText]           = useState(item?.text || '')
  const [saving, setSaving]       = useState(false)
  const [regenerating, setRegen]  = useState(false)
  const { toast } = useToast()
  const MAX = 1000

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    try {
      await onSave(item.id, text.trim())
      toast.success('Changes saved.')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleRegenerate() {
    setRegen(true)
    try {
      const updated = await onRegenerate(item.id, { topic: item.topic, tone: item.tone, language: item.language })
      setText(updated.text)
      toast.info('Draft regenerated — review and save.')
    } catch {
      toast.error('Failed to regenerate. Please try again.')
    } finally {
      setRegen(false)
    }
  }

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title="Edit Feedback Draft"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating || saving}
            className="btn-secondary mr-auto"
          >
            {regenerating
              ? <><span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> Regenerating…</>
              : <><RefreshCw size={14} /> Regenerate</>
            }
          </button>
          <button type="button" onClick={onClose} disabled={saving} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !text.trim()}
            className="btn-primary"
          >
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              : 'Save Changes'
            }
          </button>
        </>
      }
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="badge-blue">{item?.tone}</span>
            <span className="badge-slate">{item?.language}</span>
          </div>
          <span className={`text-xs ${text.length > MAX * 0.9 ? 'text-orange-600' : 'text-slate-400'}`}>
            {text.length}/{MAX}
          </span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          maxLength={MAX}
          className="input-base resize-none text-sm leading-relaxed"
          placeholder="Edit the feedback draft…"
          aria-label="Feedback text"
        />
        <p className="mt-3 text-xs text-amber-600 flex items-center gap-1.5">
          <span>ⓘ</span> AI-generated draft — review and edit before sharing.
        </p>
      </div>
    </Modal>
  )
}

// ─── Single Feedback Card ─────────────────────────────────────────────────
function FeedbackCard({ item, index, selected, onSelect, onEdit, onCopy, onRegenerate, onDelete }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(item.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopy()
    } catch {
      // clipboard not available in some contexts
    }
  }

  return (
    <div className={`bg-white border rounded-xl transition-colors ${selected ? 'border-brand-400 ring-1 ring-brand-200' : 'border-slate-200'}`}>
      <div className="flex items-start gap-4 p-5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          className="flex-shrink-0 mt-0.5 text-slate-400 hover:text-brand-600 transition-colors"
          aria-label={selected ? 'Deselect' : 'Select'}
          aria-pressed={selected}
        >
          {selected
            ? <CheckSquare size={18} className="text-brand-600" />
            : <Square size={18} />
          }
        </button>

        {/* Number */}
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 mt-0.5">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-800 leading-relaxed">
            {item.text}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {item.edited && (
              <span className="text-2xs text-slate-400 italic">Edited</span>
            )}
            <span className="text-2xs text-slate-400">{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
        <button
          onClick={() => onEdit(item)}
          className="btn-ghost text-xs gap-1.5"
          aria-label="Edit draft"
        >
          <Edit3 size={13} /> Edit
        </button>
        <button
          onClick={handleCopy}
          className="btn-ghost text-xs gap-1.5"
          aria-label="Copy to clipboard"
        >
          {copied ? <><Check size={13} className="text-green-600" /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
        <button
          onClick={() => onRegenerate(item)}
          className="btn-ghost text-xs gap-1.5"
          aria-label="Regenerate this draft"
        >
          <RefreshCw size={13} /> Regenerate
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="btn-ghost text-xs gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
          aria-label="Delete draft"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  )
}

// ─── Bulk Actions Bar ─────────────────────────────────────────────────────
function BulkBar({ selectedIds, total, onSelectAll, onDeselectAll, onDeleteSelected, onCopySelected, onSendSelected }) {
  const allSelected = selectedIds.length === total && total > 0
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-card-md mb-4">
      <button
        type="button"
        onClick={allSelected ? onDeselectAll : onSelectAll}
        className="btn-ghost text-xs gap-1.5"
      >
        {allSelected ? <CheckSquare size={14} className="text-brand-600" /> : <Square size={14} />}
        {allSelected ? 'Deselect all' : 'Select all'}
      </button>

      <span className="text-xs text-slate-500 font-medium">
        {selectedIds.length > 0 ? `${selectedIds.length} of ${total} selected` : `${total} drafts`}
      </span>

      {selectedIds.length > 0 && (
        <>
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <button onClick={onCopySelected}    className="btn-ghost text-xs gap-1.5"><Copy size={13} /> Copy</button>
          <button onClick={onDeleteSelected}  className="btn-ghost text-xs gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 size={13} /> Delete</button>
          <button onClick={onSendSelected}    className="btn-primary text-xs px-3 py-1.5 ml-auto gap-1.5"><Send size={13} /> Send Selected</button>
        </>
      )}

      {selectedIds.length === 0 && (
        <Link to="/send" className="btn-primary text-xs px-3 py-1.5 ml-auto gap-1.5">
          <Send size={13} /> Send Feedback
        </Link>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function FeedbackList() {
  const { toast }    = useToast()
  const navigate     = useNavigate()
  const location     = useLocation()

  const [session, setSession]       = useState(null)
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [selectedIds, setSelected]  = useState([])
  const [editItem, setEditItem]     = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const [regenItem, setRegenItem]   = useState(null)

  // Load: prefer freshly generated from sessionStorage, else fetch list
  useEffect(() => {
    const stored = sessionStorage.getItem('sf_generated')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSession(parsed)
        setItems(parsed.items)
        setLoading(false)
        return
      } catch { /* fall through */ }
    }
    // Load most recent session
    feedbackService.getAll().then((sessions) => {
      if (sessions.length) {
        const s = sessions[0]
        setSession(s)
        setItems(s.items)
      }
    }).finally(() => setLoading(false))
  }, [location.state])

  // ── Selection ──
  function toggleSelect(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }
  const selectAll   = () => setSelected(items.map((i) => i.id))
  const deselectAll = () => setSelected([])

  // ── Edit ──
  async function handleSave(id, text) {
    const updated = await feedbackService.update(id, { text, edited: true })
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, text, edited: true } : i))
  }

  // ── Regenerate one ──
  async function handleRegenerateOne(item) {
    setRegenItem(item.id)
    try {
      const fresh = await feedbackService.regenerateOne(item.id, {
        topic: session?.topic || item.topic,
        tone: item.tone,
        language: item.language,
      })
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, text: fresh.text, edited: false } : i))
      toast.success('Draft regenerated.')
    } catch {
      toast.error('Regeneration failed. Please try again.')
    } finally {
      setRegenItem(null)
    }
  }

  // For editor modal regenerate button
  async function editorRegenerate(id, params) {
    const fresh = await feedbackService.regenerateOne(id, params)
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, text: fresh.text, edited: false } : i))
    return fresh
  }

  // ── Delete ──
  async function confirmDelete() {
    setDeleting(true)
    try {
      await feedbackService.delete(deleteId)
      setItems((prev) => prev.filter((i) => i.id !== deleteId))
      setSelected((prev) => prev.filter((x) => x !== deleteId))
      toast.success('Draft deleted.')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  async function deleteSelected() {
    for (const id of selectedIds) {
      await feedbackService.delete(id)
    }
    setItems((prev) => prev.filter((i) => !selectedIds.includes(i.id)))
    toast.success(`${selectedIds.length} draft${selectedIds.length > 1 ? 's' : ''} deleted.`)
    setSelected([])
  }

  // ── Copy all selected ──
  async function copySelected() {
    const texts = items.filter((i) => selectedIds.includes(i.id)).map((i) => i.text).join('\n\n---\n\n')
    try {
      await navigator.clipboard.writeText(texts)
      toast.success(`${selectedIds.length} draft${selectedIds.length > 1 ? 's' : ''} copied to clipboard.`)
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }

  // ── Send selected ──
  function sendSelected() {
    const sel = items.filter((i) => selectedIds.includes(i.id))
    sessionStorage.setItem('sf_send_feedback', JSON.stringify(sel))
    navigate('/send')
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="h-8 skeleton rounded-lg w-64 mb-6" />
        {[1,2,3].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No feedback drafts yet"
        description="Generate feedback to see your drafts here. Each draft is editable before you share it."
        action={
          <Link to="/generate" className="btn-primary gap-2">
            <Zap size={15} /> Generate Your First Feedback
          </Link>
        }
      />
    )
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Generated Feedback</h1>
          {session && (
            <p className="mt-1 text-sm text-slate-500">
              {items.length} draft{items.length !== 1 ? 's' : ''} · {session.topic} · {session.tone}
            </p>
          )}
        </div>
        <Link to="/generate" className="btn-secondary flex-shrink-0 gap-1.5 text-sm">
          <Zap size={14} /> New Session
        </Link>
      </div>

      {/* AI notice */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg mb-5 text-xs text-amber-700">
        <span className="font-medium">ⓘ AI-generated drafts</span> — review and edit before sharing.
      </div>

      {/* Bulk bar */}
      <BulkBar
        selectedIds={selectedIds}
        total={items.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onDeleteSelected={deleteSelected}
        onCopySelected={copySelected}
        onSendSelected={sendSelected}
      />

      {/* Cards */}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="relative">
            {regenItem === item.id && (
              <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center z-10">
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-4 h-4 border-2 border-brand-400 border-t-brand-600 rounded-full animate-spin" />
                  Regenerating…
                </span>
              </div>
            )}
            <FeedbackCard
              item={item}
              index={i}
              selected={selectedIds.includes(item.id)}
              onSelect={toggleSelect}
              onEdit={setEditItem}
              onCopy={() => toast.success('Feedback copied.')}
              onRegenerate={handleRegenerateOne}
              onDelete={setDeleteId}
            />
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      {items.length > 0 && (
        <div className="mt-6 flex items-center justify-between py-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">{items.length} draft{items.length !== 1 ? 's' : ''} ready</p>
          <button onClick={sendSelected} className="btn-primary gap-2">
            <Send size={15} />
            {selectedIds.length > 0 ? `Send ${selectedIds.length} Selected` : 'Send Feedback'}
          </button>
        </div>
      )}

      {/* Editor Modal */}
      {editItem && (
        <FeedbackEditor
          item={editItem}
          onSave={handleSave}
          onRegenerate={editorRegenerate}
          onClose={() => setEditItem(null)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this draft?"
        message="This draft will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
