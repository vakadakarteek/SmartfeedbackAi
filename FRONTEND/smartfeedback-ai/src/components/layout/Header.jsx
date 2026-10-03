import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuClick, title, subtitle }) {
  const { user } = useAuth()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div>
            {title ? (
              <div>
                <h1 className="text-base font-semibold text-slate-900 leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                {greeting},{' '}
                <span className="font-semibold text-slate-900">{user?.name?.split(' ')[0] || 'there'}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
          </button>
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-xs font-semibold text-brand-700">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
