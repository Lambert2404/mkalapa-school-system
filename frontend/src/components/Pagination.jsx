import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, hasNext, hasPrevious, onPageChange, totalCount, pageSize = 50 }) {
  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : null

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <p className="text-xs text-muted">
        {totalCount != null ? `${totalCount} total records` : ''}
        {totalPages ? ` · Page ${page} of ${totalPages}` : ''}
      </p>
      <div className="flex gap-2">
        <button
          className="btn-secondary !px-3 !py-1.5"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <button
          className="btn-secondary !px-3 !py-1.5"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
