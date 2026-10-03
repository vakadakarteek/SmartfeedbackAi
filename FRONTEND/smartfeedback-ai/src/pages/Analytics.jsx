import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { BarChart2, MessageSquareText, Send, CheckCircle2, XCircle, Users } from 'lucide-react'
import { analyticsService } from '../services/analyticsService'
import { SkeletonStat } from '../components/common/Skeleton'

const BRAND_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']
const CHANNEL_COLORS = { SMS: '#4f46e5', Email: '#0ea5e9', WhatsApp: '#22c55e' }
const OUTCOME_COLORS = ['#22c55e', '#ef4444']

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-800 mb-5">{title}</h3>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card-md px-3 py-2.5 text-xs">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [charts,  setCharts]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsService.getSummary(), analyticsService.getCharts()])
      .then(([s, c]) => { setSummary(s); setCharts(c) })
      .finally(() => setLoading(false))
  }, [])

  const summaryCards = summary ? [
    { label: 'Feedback Generated',    value: summary.totalFeedbackGenerated, icon: MessageSquareText, color: 'bg-brand-50 text-brand-600'    },
    { label: 'Messages Sent',         value: summary.totalMessagesSent,      icon: Send,             color: 'bg-blue-50 text-blue-600'       },
    { label: 'Successful Deliveries', value: summary.successfulDeliveries,   icon: CheckCircle2,     color: 'bg-green-50 text-green-600'     },
    { label: 'Failed Messages',       value: summary.failedMessages,         icon: XCircle,          color: 'bg-red-50 text-red-500'         },
    { label: 'Active Contacts',       value: summary.activeContacts,         icon: Users,            color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Success Rate',          value: `${summary.successRate}%`,      icon: BarChart2,        color: 'bg-slate-50 text-slate-600'     },
  ] : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your feedback generation and messaging activity.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonStat key={i} />)
          : summaryCards.map(s => (
            <div key={s.label} className="card p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon size={16} />
              </div>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))
        }
      </div>

      {!loading && charts && (
        <div className="space-y-6">
          {/* Row 1: two line/bar charts */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Feedback over time */}
            <ChartCard title="Feedback Generated (last 6 months)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={charts.feedbackOverTime} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Drafts" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Messages sent vs delivered */}
            <ChartCard title="Messages Sent vs Delivered">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={charts.messagesOverTime} margin={{ top: 0, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="sent"      name="Sent"      stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 2: three smaller charts */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Channel distribution */}
            <ChartCard title="Channel Distribution">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={charts.channelDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {charts.channelDistribution.map(entry => (
                      <Cell key={entry.name} fill={CHANNEL_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Send outcome */}
            <ChartCard title="Delivery Outcome">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={charts.sendingOutcome} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {charts.sendingOutcome.map((entry, i) => (
                      <Cell key={entry.name} fill={OUTCOME_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Tone distribution */}
            <ChartCard title="Feedback Tone Distribution">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={charts.toneDistribution} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Drafts" radius={[0, 4, 4, 0]}>
                    {charts.toneDistribution.map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  )
}
