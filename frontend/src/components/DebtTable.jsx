import DataTable from './DataTable.jsx'
import { formatTSh, formatKG, monthLabel, statusBadgeClass, statusLabel } from '../utils/format.js'
import { MessageSquare } from 'lucide-react'

export default function DebtTable({ rows, loading, selectedIds, onToggleSelect, onToggleSelectAll, onSendSMS }) {
  const columns = [
    { key: 'student_id', label: 'ID' },
    { key: 'student_name', label: 'Name' },
    { key: 'class_name', label: 'Class', render: (r) => `${r.class_name} ${r.stream}` },
    { key: 'guardian_name', label: 'Guardian' },
    { key: 'guardian_phone', label: 'Phone' },
    { key: 'period', label: 'Period', render: (r) => `${monthLabel(r.month)} ${r.year}` },
    { key: 'mahindi_debt', label: 'Mahindi', render: (r) => r.mahindi_debt > 0 ? formatKG(r.mahindi_debt) : '—' },
    { key: 'mboga_debt', label: 'Mboga', render: (r) => r.mboga_debt > 0 ? formatKG(r.mboga_debt) : '—' },
    { key: 'cash_debt', label: 'Cash', render: (r) => r.cash_debt > 0 ? formatTSh(r.cash_debt) : '—' },
    { key: 'status', label: 'Status', render: (r) => <span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span> },
    { key: 'sms_status', label: 'SMS', render: (r) => <span className={statusBadgeClass(r.sms_status)}>{statusLabel(r.sms_status)}</span> },
    { key: 'actions', label: '', render: (r) => (
      <button
        className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-canvas"
        onClick={(e) => { e.stopPropagation(); onSendSMS(r) }}
      >
        <MessageSquare size={14} /> Send SMS
      </button>
    ) },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      loading={loading}
      emptyTitle="No students have outstanding contributions."
      selectable
      selectedIds={selectedIds}
      onToggleSelect={onToggleSelect}
      onToggleSelectAll={onToggleSelectAll}
    />
  )
}
