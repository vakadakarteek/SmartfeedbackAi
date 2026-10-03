import clsx from 'clsx'

export default function StatCard({ label, value, icon: Icon, trend, trendLabel, iconColor = 'bg-brand-50 text-brand-600' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        {Icon && (
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', iconColor)}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      {trendLabel && (
        <p className={clsx('text-xs font-medium', trend === 'up' ? 'text-green-600' : 'text-red-500')}>
          {trend === 'up' ? '↑' : '↓'} {trendLabel}
        </p>
      )}
    </div>
  )
}
