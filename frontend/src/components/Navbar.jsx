import { Menu, Bell } from 'lucide-react'

export default function Navbar({ title, onMenuClick, notifications = 0 }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-ink hover:bg-canvas lg:hidden"
      >
        <Menu size={20} />
      </button>
      <h1 className="font-display text-lg font-semibold text-ink sm:text-xl">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink">
          <Bell size={18} />
          {notifications > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-brick-500" />
          )}
        </button>
      </div>
    </header>
  )
}
