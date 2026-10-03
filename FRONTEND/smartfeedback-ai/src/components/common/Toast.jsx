import { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import clsx from 'clsx'

const icons = {
  success: { Icon: CheckCircle2, color: 'text-green-600' },
  error:   { Icon: XCircle,      color: 'text-red-600'   },
  warning: { Icon: AlertCircle,  color: 'text-orange-500' },
  info:    { Icon: Info,         color: 'text-blue-600'  },
}

function ToastItem({ toast, onRemove }) {
  const { Icon, color } = icons[toast.type] || icons.info

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={clsx(
        'toast-enter flex items-start gap-3 bg-white border border-slate-200 rounded-xl shadow-card-lg',
        'px-4 py-3 min-w-[280px] max-w-sm pointer-events-auto'
      )}
    >
      <Icon size={17} className={clsx('flex-shrink-0 mt-0.5', color)} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-medium text-slate-900">{toast.title}</p>
        )}
        <p className="text-sm text-slate-600">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (!toasts.length) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
