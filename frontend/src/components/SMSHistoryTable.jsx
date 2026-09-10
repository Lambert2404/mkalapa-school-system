import DataTable from './DataTable.jsx'
import { statusBadgeClass, statusLabel } from '../utils/format.js'

export default function SMSHistoryTable({ rows, loading }) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleString() },
    { key: 'student', label: 'Student', render: (r) => r.student_detail?.full_name || '—' },
    { key: 'guardian', label: 'Parent/Guardian', render: (r) => r.student_detail?.guardian_name || '—' },
    { key: 'phone', label: 'Phone' },
    { key: 'message', label: 'Message', render: (r) => (
      <span className="block max-w-xs truncate" title={r.message}>{r.message}</span>
    ) },
    { key: 'message_type', label: 'Type', render: (r) => r.message_type.replace('_', ' ') },
    { key: 'status', label: 'Status', render: (r) => <span className={statusBadgeClass(r.status)}>{statusLabel(r.status)}</span> },
    { key: 'gateway_response', label: 'Gateway Response', render: (r) => (
      <span className="block max-w-[160px] truncate text-xs text-muted" title={r.gateway_response || r.error_message}>
        {r.error_message || r.gateway_response || '—'}
      </span>
    ) },
  ]

  return (
    <DataTable columns={columns} rows={rows} loading={loading} emptyTitle="No SMS messages found." />
  )
}
