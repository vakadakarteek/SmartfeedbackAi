import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Zap, FileText, Users, Send, History,
  BarChart2, Settings, User, LogOut, MessageSquareText, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard',          path: '/dashboard',   icon: LayoutDashboard },
  { label: 'Generate Feedback',  path: '/generate',    icon: Zap },
  { label: 'Generated Feedback', path: '/feedback',    icon: FileText },
  { label: 'Contacts',           path: '/contacts',    icon: Users },
  { label: 'Send Feedback',      path: '/send',        icon: Send },
  { label: 'History',            path: '/history',     icon: History },
  { label: 'Analytics',          path: '/analytics',   icon: BarChart2 },
]

const bottomItems = [
  { label: 'Settings', path: '/settings', icon: Settings },
  { label: 'Profile',  path: '/profile',  icon: User },
]

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <MessageSquareText size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm leading-tight">
            SmartFeedback<br />
            <span className="text-brand-600">AI</span>
          </span>
        </div>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  clsx('sidebar-item', isActive && 'active')
                }
              >
                <Icon size={17} className="flex-shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-0.5">
        {bottomItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              clsx('sidebar-item', isActive && 'active')
            }
          >
            <Icon size={17} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        {/* User info + Logout */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-brand-700">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">{user?.name || 'User'}</p>
              <p className="text-2xs text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={17} className="flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative z-50 flex flex-col w-72 bg-white shadow-xl h-full">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
