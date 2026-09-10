import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Table2, Wallet, AlertTriangle,
  MessageSquareText, FileBarChart2, Settings, GraduationCap, X,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/spreadsheet', label: 'Spreadsheet', icon: Table2 },
  { to: '/contributions', label: 'Contributions', icon: Wallet },
  { to: '/debts', label: 'Debts', icon: AlertTriangle },
  { to: '/sms', label: 'SMS Management', icon: MessageSquareText },
  { to: '/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-forest-700
        transition-transform duration-200 lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-maize-400 text-forest-900">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="font-display text-sm font-semibold leading-tight text-white">Mkalapa</p>
              <p className="text-[11px] leading-tight text-forest-100/70">Secondary School</p>
            </div>
          </div>
          <button onClick={onClose} className="text-forest-100/70 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-900/60 text-white'
                    : 'text-forest-100/80 hover:bg-forest-600/60 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-forest-600/60 px-5 py-4">
          <p className="text-[11px] leading-snug text-forest-100/60">
            Student Contribution, Debt &amp; SMS Management System
          </p>
        </div>
      </aside>
    </>
  )
}
