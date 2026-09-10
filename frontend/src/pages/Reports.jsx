import { useEffect, useState, useCallback } from 'react'
import { Download, FileText } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

import reportService from '../services/reportService.js'
import FilterBar from '../components/FilterBar.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { formatTSh, formatKG, monthLabel } from '../utils/format.js'
import { MONTHS, CLASSES, STREAMS } from '../utils/format.js'
import { useToast } from '../hooks/useToast.jsx'

const REPORT_TABS = [
  { key: 'monthly', label: 'Monthly Contribution Report' },
  { key: 'debts', label: 'Student Debt Report' },
  { key: 'sms', label: 'SMS Report' },
  { key: 'completed', label: 'Completed Students Report' },
]

export default function Reports() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('monthly')
  const [filters, setFilters] = useState({})
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const fn = { monthly: reportService.monthly, debts: reportService.debts, sms: reportService.sms, completed: reportService.completed }[activeTab]
    fn(filters)
      .then((res) => setData(res.data))
      .catch((err) => addToast(err.friendlyMessage || 'Failed to load report.', 'error'))
      .finally(() => setLoading(false))
  }, [activeTab, filters])

  useEffect(() => { load() }, [load])

  const flattenForExport = () => {
    if (activeTab === 'monthly') return data || []
    if (activeTab === 'debts') return data?.records || []
    if (activeTab === 'sms') return data?.messages || []
    return data || []
  }

  const exportCSV = () => {
    const rows = flattenForExport()
    if (!rows.length) { addToast('No data to export.', 'error'); return }
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mkalapa_${activeTab}_report.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = () => {
    const rows = flattenForExport()
    if (!rows.length) { addToast('No data to export.', 'error'); return }
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, `mkalapa_${activeTab}_report.xlsx`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {REPORT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key ? 'bg-forest-700 text-white' : 'text-muted hover:bg-canvas'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          filters={[
            { name: 'month', label: 'All Months', options: MONTHS },
            { name: 'year', label: 'All Years', options: ['2025', '2026'] },
            { name: 'class_name', label: 'All Classes', options: CLASSES },
            { name: 'stream', label: 'All Streams', options: STREAMS },
          ]}
          values={filters}
          onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value }))}
        />
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={exportCSV}><Download size={16} /> CSV</button>
          <button className="btn-secondary" onClick={exportExcel}><FileText size={16} /> Excel</button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Generating report..." fullPage /> : (
        <ReportBody activeTab={activeTab} data={data} />
      )}
    </div>
  )
}

function ReportBody({ activeTab, data }) {
  if (!data) return null

  if (activeTab === 'monthly') {
    if (!data.length) return <EmptyState title="No contribution records found." />
    return (
      <div className="card overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas/60 text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Records</th>
              <th className="px-4 py-3">Mahindi Submitted</th>
              <th className="px-4 py-3">Mboga Submitted</th>
              <th className="px-4 py-3">Cash Submitted</th>
              <th className="px-4 py-3">Mahindi Debt</th>
              <th className="px-4 py-3">Mboga Debt</th>
              <th className="px-4 py-3">Cash Debt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-3">{monthLabel(row.month)} {row.year}</td>
                <td className="px-4 py-3">{row.record_count}</td>
                <td className="px-4 py-3">{formatKG(row.total_mahindi_submitted)}</td>
                <td className="px-4 py-3">{formatKG(row.total_mboga_submitted)}</td>
                <td className="px-4 py-3">{formatTSh(row.total_cash_submitted)}</td>
                <td className="px-4 py-3">{formatKG(row.total_mahindi_debt)}</td>
                <td className="px-4 py-3">{formatKG(row.total_mboga_debt)}</td>
                <td className="px-4 py-3">{formatTSh(row.total_cash_debt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (activeTab === 'debts') {
    if (!data.records?.length) return <EmptyState title="No students have outstanding contributions." />
    return (
      <div className="space-y-4">
        <div className="card overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Mahindi Debt</th>
                <th className="px-4 py-3">Mboga Debt</th>
                <th className="px-4 py-3">Cash Debt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.by_class.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">{row.student__class_name}</td>
                  <td className="px-4 py-3">{row.student_count}</td>
                  <td className="px-4 py-3">{formatKG(row.total_mahindi_debt)}</td>
                  <td className="px-4 py-3">{formatKG(row.total_mboga_debt)}</td>
                  <td className="px-4 py-3">{formatTSh(row.total_cash_debt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (activeTab === 'sms') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-semibold text-ink">{data.summary.sent}</p>
            <p className="text-xs text-muted">Sent</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-semibold text-ink">{data.summary.failed}</p>
            <p className="text-xs text-muted">Failed</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-semibold text-ink">{data.summary.pending}</p>
            <p className="text-xs text-muted">Pending</p>
          </div>
        </div>
      </div>
    )
  }

  if (activeTab === 'completed') {
    if (!data.length) return <EmptyState title="No completed students found." />
    return (
      <div className="card overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas/60 text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Period</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">{row.student_name}</td>
                <td className="px-4 py-3">{row.class_name} {row.stream}</td>
                <td className="px-4 py-3">{monthLabel(row.month)} {row.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}
