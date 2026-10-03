import { Link } from 'react-router-dom'
import {
  Zap, Users, Send, History, FileText, UserPlus,
  MessageSquareText, BarChart2, ArrowRight, Clock,
  CheckCircle2, PlusCircle
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../utils/formatters'

// ─── Stats ──────────────────────────────────────────────────────────────────
const stats = [
  {
    label: 'Feedback Generated',
    value: '128',
    icon: MessageSquareText,
    color: 'bg-brand-50 text-brand-600',
    trend: 'up',
    trendLabel: '12 this week',
  },
  {
    label: 'Contacts',
    value: '86',
    icon: Users,
    color: 'bg-emerald-50 text-emerald-600',
    trend: 'up',
    trendLabel: '4 added recently',
  },
  {
    label: 'Messages Sent',
    value: '214',
    icon: Send,
    color: 'bg-blue-50 text-blue-600',
    trend: 'up',
    trendLabel: '28 this month',
  },
  {
    label: 'Success Rate',
    value: '96%',
    icon: CheckCircle2,
    color: 'bg-green-50 text-green-600',
    trend: 'up',
    trendLabel: 'Above average',
  },
]

// ─── Recent Activity ─────────────────────────────────────────────────────────
const recentActivity = [
  {
    type: 'feedback',
    title: 'Feedback generated',
    detail: 'College Technical Workshop — 10 drafts',
    time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    icon: Zap,
    iconColor: 'bg-brand-50 text-brand-600',
  },
  {
    type: 'message',
    title: 'Messages sent',
    detail: '8 contacts via SMS',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    icon: Send,
    iconColor: 'bg-blue-50 text-blue-600',
  },
  {
    type: 'contact',
    title: 'New contact added',
    detail: 'Sneha Varma',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    icon: UserPlus,
    iconColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    type: 'feedback',
    title: 'Feedback generated',
    detail: 'Faculty Development Program — 5 drafts',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    icon: Zap,
    iconColor: 'bg-brand-50 text-brand-600',
  },
  {
    type: 'message',
    title: 'Messages sent',
    detail: '20 contacts via WhatsApp',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    icon: Send,
    iconColor: 'bg-blue-50 text-blue-600',
  },
]

// ─── Quick Actions ───────────────────────────────────────────────────────────
const quickActions = [
  { label: 'Generate Feedback', icon: Zap,     path: '/generate',  desc: 'Create new AI drafts',        color: 'text-brand-600 bg-brand-50 hover:bg-brand-100' },
  { label: 'Add Contact',       icon: UserPlus, path: '/contacts/add', desc: 'Add a new contact',        color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
  { label: 'Send Feedback',     icon: Send,     path: '/send',      desc: 'Send to your contacts',       color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
  { label: 'View History',      icon: History,  path: '/history',   desc: 'Review past sends',           color: 'text-slate-600 bg-slate-50 hover:bg-slate-100' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Page greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">
            {greeting}, {user?.name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage your feedback drafts from one place.
          </p>
        </div>
        <Link to="/generate" className="btn-primary flex-shrink-0">
          <Zap size={15} />
          Generate Feedback
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 leading-tight">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{s.value}</p>
            <p className="text-xs text-green-600 font-medium">↑ {s.trendLabel}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity — 2/3 width */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Activity</h2>
            <Link to="/history" className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="card divide-y divide-slate-100">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${item.iconColor}`}>
                  <item.icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-500 truncate">{item.detail}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 text-slate-400">
                  <Clock size={12} />
                  <span className="text-xs">{timeAgo(item.time)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions — 1/3 width */}
        <div>
          <h2 className="section-title mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.path}
                className={`flex items-center gap-4 p-4 rounded-xl border border-slate-200 transition-colors ${a.color}`}
              >
                <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
                  <a.icon size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">{a.label}</p>
                  <p className="text-xs opacity-70">{a.desc}</p>
                </div>
                <ArrowRight size={15} className="ml-auto flex-shrink-0 opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Feedback Sessions</h2>
          <Link to="/feedback" className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { topic: 'College Technical Workshop', count: 10, tone: 'Professional', date: '2 minutes ago', channel: 'SMS' },
            { topic: 'Faculty Development Program', count: 5,  tone: 'Positive',     date: '1 day ago',   channel: 'Email' },
            { topic: 'Student Orientation',         count: 8,  tone: 'Casual',       date: '3 days ago',  channel: 'WhatsApp' },
          ].map((session) => (
            <div key={session.topic} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <FileText size={15} className="text-brand-600" />
                </div>
                <span className="badge-slate text-2xs">{session.tone}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1 leading-tight">{session.topic}</h3>
              <p className="text-xs text-slate-500 mb-3">{session.count} drafts · {session.date}</p>
              <div className="flex items-center justify-between">
                <span className="badge-blue">{session.channel}</span>
                <Link to="/feedback" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                  Review <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          ))}

          {/* New session CTA */}
          <Link
            to="/generate"
            className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
              <PlusCircle size={20} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 group-hover:text-brand-700">New Session</p>
              <p className="text-xs text-slate-400">Generate feedback drafts</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
