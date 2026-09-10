import LoadingSpinner from './LoadingSpinner.jsx'
import EmptyState from './EmptyState.jsx'

export default function DataTable({ columns, rows, loading, emptyTitle = 'No records found.', rowKey = 'id', onRowClick, selectable, selectedIds, onToggleSelect, onToggleSelectAll }) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading..." />
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} />
  }

  const allSelected = selectable && rows.length > 0 && rows.every((r) => selectedIds?.has(r[rowKey]))

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-canvas/60">
            {selectable && (
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-canvas/60' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {selectable && (
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds?.has(row[rowKey]) || false}
                    onChange={() => onToggleSelect(row[rowKey])}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="whitespace-nowrap px-4 py-3 text-ink">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
