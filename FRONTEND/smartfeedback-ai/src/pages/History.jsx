import { useState, useEffect } from 'react'
import { Search, Filter, History as HistoryIcon, ChevronRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { messageService } from '../services/messageService'
import { formatDate, formatDateTime } from '../utils/formatters'
import EmptyState from '../components/common/EmptyState'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import { SkeletonTable } from '../components/common/Skeleton'

const STATUS_CONFIG = {
  Completed: { variant: 'green',  icon: CheckCircle2, label: 'Completed' },
  Partial:   { variant: 'orange', icon: AlertCircle,  label: 'Partial'   },
  Failed:    { variant: 'red',    icon: AlertCircle,  label: 'Failed'    },
  Pending:   { variant: 'slate',  icon: Clock,        label: 'Pending'   },
}

const CHANNELS = ['All', 'SMS', 'Email', 'WhatsApp']

function DetailModal({ item, onClose }) {
  if (!item) return null
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending
  return (
    <Modal open title="Sending Details" onClose={onClose} size="md"
      footer={<button className="btn-secondary" onClick={onClose}>Close</button>}
    >
      <div className="space-y-5">
        {/* Campaign header */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <HistoryIcon size={18} className="text-brand-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{item.campaign || item.feedback}</h3>
            <p className="text-sm text-slate-500">{formatDateTime(item.date)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Recipients', value: item.recipients },
            { label: 'Sent',       value: item.sent       },
            { label: 'Failed',     value: item.failed, red: item.failed > 0 },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-xl font-bold ${s.red ? 'text-red-500' : 'text-slate-900'}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Details table */}
        <div className="space-y-0 border border-slate-200 rounded-xl overflow-hidden">
          {[
            { label: 'Channel',   value: item.channel  },
            { label: 'Status',    value: <Badge variant={cfg.variant} dot>{cfg.label}</Badge> },
            { label: 'Delivered', value: item.delivered },
            { label: 'Date',      value: formatDate(item.date) },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500">{row.label}</span>
              <span className="text-sm font-medium text-slate-900">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Message preview */}
        {item.message && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Message Sent</p>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
              <p className="text-sm text-slate-700 leading-relaxed">{item.message}</p>
            </div>
          </div>
        )}

        {/* Contacts */}
        {item.contacts?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recipients</p>
            <div className="flex flex-wrap gap-2">
              {item.contacts.map((name, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-2xs font-bold text-brand-700">{name.charAt(0)}</span>
                  </div>
                  <span className="text-xs text-slate-700">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default function History() {
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [channel, setChannel]   = useState('All')
  const [status, setStatus]     = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    messageService.getHistory().then(setHistory).finally(() => setLoading(false))
  }, [])

  const filtered = history.filter(h => {
    const matchSearch  = !search || h.campaign?.toLowerCase().includes(search.toLowerCase()) || h.feedback?.toLowerCase().includes(search.toLowerCase())
    const matchChannel = channel === 'All' || h.channel === channel
    const matchStatus  = status  === 'All' || h.status  === status
    return matchSearch && matchChannel && matchStatus
  })

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title">Sending History</h1>
          <p className="mt-1 text-sm text-slate-500">{history.length} send record{history.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search history…" className="input-base pl-9" />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select value={channel} onChange={e => setChannel(e.target.value)} className="input-base appearance-none pr-8 text-sm">
              {CHANNELS.map(c => <option key={c}>{c}</option>)}
            </select>
            <Filter size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={status} onChange={e => setStatus(e.target.value)} className="input-base appearance-none pr-8 text-sm">
              {['All', 'Completed', 'Partial', 'Failed'].map(s => <option key={s}>{s}</option>)}
            </select>
            <Filter size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card p-5"><SkeletonTable rows={5} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No sending history yet"
          description={search ? 'No records match your search.' : 'Your sent feedback records will appear here.'}
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Head */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
            {['Campaign', 'Recipients', 'Channel', 'Status', ''].map(h => (
              <span key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</span>
            ))}
          </div>

          {filtered.map(item => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending
            return (
              <div key={item.id}
                className="table-row cursor-pointer px-5 py-4 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-3 sm:gap-4"
                onClick={() => setSelected(item)}
              >
                {/* Campaign */}
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.campaign || item.feedback}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(item.date)}</p>
                </div>

                {/* Recipients */}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-700 font-medium">{item.recipients}</span>
                  <span className="text-xs text-slate-400">contacts</span>
                </div>

                {/* Channel */}
                <div>
                  <Badge variant="slate">{item.channel}</Badge>
                </div>

                {/* Status */}
                <div>
                  <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                </div>

                {/* Arrow */}
                <ChevronRight size={16} className="text-slate-300 hidden sm:block" />
              </div>
            )
          })}
        </div>
      )}

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
