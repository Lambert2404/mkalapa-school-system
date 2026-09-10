export default function DashboardCard({ label, value, icon: Icon, tone = 'forest', suffix }) {
  const toneStyles = {
    forest: 'bg-forest-50 text-forest-700',
    maize: 'bg-maize-50 text-maize-600',
    brick: 'bg-brick-50 text-brick-600',
    ink: 'bg-canvas text-ink',
  }

  return (
    <div className="card flex items-start justify-between gap-3 p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-2 font-display text-2xl font-semibold text-ink">
          {value}
          {suffix && <span className="ml-1 text-sm font-medium text-muted">{suffix}</span>}
        </p>
      </div>
      {Icon && (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  )
}
