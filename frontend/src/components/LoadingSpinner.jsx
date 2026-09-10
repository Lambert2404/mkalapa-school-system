import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ label = 'Loading...', size = 20, fullPage = false }) {
  const content = (
    <div className="flex items-center gap-2.5 text-muted">
      <Loader2 size={size} className="animate-spin text-forest-600" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )

  if (fullPage) {
    return <div className="flex h-64 w-full items-center justify-center">{content}</div>
  }
  return content
}
