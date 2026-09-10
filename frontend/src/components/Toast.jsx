import { CheckCircle2, XCircle, X, Info } from 'lucide-react'

const styles = {
  success: 'bg-forest-700 text-white',
  error: 'bg-brick-500 text-white',
  info: 'bg-ink text-white',
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export default function Toast({ message, type = 'success', onClose }) {
  const Icon = icons[type] || Info
  return (
    <div className={`flex items-center gap-2.5 rounded-lg px-4 py-3 shadow-lg ${styles[type]} min-w-[260px] max-w-sm animate-[fadeIn_0.15s_ease-out]`}>
      <Icon size={18} className="shrink-0" />
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button onClick={onClose} className="ml-auto shrink-0 opacity-80 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  )
}
