export default function ChartCard({ title, subtitle, children, actions }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}
