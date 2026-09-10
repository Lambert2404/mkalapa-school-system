import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, Send } from 'lucide-react'

import debtService from '../services/debtService.js'
import DebtTable from '../components/DebtTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Pagination from '../components/Pagination.jsx'
import SMSModal from '../components/SMSModal.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { MONTHS, CLASSES, STREAMS } from '../utils/format.js'

export default function Debts() {
  const { addToast } = useToast()
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [next, setNext] = useState(null)
  const [previous, setPrevious] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [smsModalOpen, setSmsModalOpen] = useState(false)
  const [smsTargetIds, setSmsTargetIds] = useState([])

  const fetchDebts = useCallback(() => {
    setLoading(true)
    debtService.list({ search, page, ...filters })
      .then((res) => {
        setRows(res.data.results ?? res.data)
        setCount(res.data.count ?? (res.data.length || 0))
        setNext(res.data.next)
        setPrevious(res.data.previous)
      })
      .catch((err) => addToast(err.friendlyMessage || 'Failed to load debts.', 'error'))
      .finally(() => setLoading(false))
  }, [search, page, filters])

  useEffect(() => { fetchDebts() }, [fetchDebts])
  useEffect(() => { setPage(1); setSelectedIds(new Set()) }, [search, filters])

  const handleFilterChange = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allSelected = rows.every((r) => prev.has(r.id))
      if (allSelected) return new Set()
      return new Set(rows.map((r) => r.id))
    })
  }

  const openSMSForSingle = (row) => { setSmsTargetIds([row.id]); setSmsModalOpen(true) }
  const openSMSForSelected = () => { setSmsTargetIds(Array.from(selectedIds)); setSmsModalOpen(true) }
  const openSMSForAll = () => { setSmsTargetIds(rows.map((r) => r.id)); setSmsModalOpen(true) }

  const handleSmsSent = (result) => {
    setSmsModalOpen(false)
    addToast(`SMS sent: ${result.sent} succeeded, ${result.failed} failed.`, result.failed > 0 ? 'error' : 'success')
    setSelectedIds(new Set())
    fetchDebts()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID..." />
          <FilterBar
            filters={[
              { name: 'month', label: 'All Months', options: MONTHS },
              { name: 'year', label: 'All Years', options: ['2025', '2026'] },
              { name: 'class_name', label: 'All Classes', options: CLASSES },
              { name: 'stream', label: 'All Streams', options: STREAMS },
              { name: 'debt_type', label: 'All Debt Types', options: [
                { value: 'mahindi', label: 'Mahindi' }, { value: 'mboga', label: 'Mboga' }, { value: 'cash', label: 'Cash' },
              ] },
              { name: 'sms_status', label: 'All SMS Status', options: ['NOT_SENT', 'SENT', 'FAILED'] },
            ]}
            values={filters}
            onChange={handleFilterChange}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" disabled={selectedIds.size === 0} onClick={openSMSForSelected}>
            <MessageSquare size={16} /> Send to Selected ({selectedIds.size})
          </button>
          <button className="btn-primary" onClick={openSMSForAll} disabled={rows.length === 0}>
            <Send size={16} /> Send to All Debtors
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <DebtTable
          rows={rows}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onSendSMS={openSMSForSingle}
        />
        {!loading && rows.length > 0 && (
          <Pagination page={page} hasNext={!!next} hasPrevious={!!previous} onPageChange={setPage} totalCount={count} />
        )}
      </div>

      <SMSModal
        open={smsModalOpen}
        contributionIds={smsTargetIds}
        onClose={() => setSmsModalOpen(false)}
        onSent={handleSmsSent}
      />
    </div>
  )
}
