import { useEffect, useState, useCallback } from 'react'
import { Send } from 'lucide-react'

import smsService from '../services/smsService.js'
import studentService from '../services/studentService.js'
import SMSHistoryTable from '../components/SMSHistoryTable.jsx'
import FilterBar from '../components/FilterBar.jsx'
import Pagination from '../components/Pagination.jsx'
import ConfirmationModal from '../components/ConfirmationModal.jsx'
import DashboardCard from '../components/DashboardCard.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { MessageSquareText, MessageSquareX, Clock } from 'lucide-react'

export default function SMSManagement() {
  const { addToast } = useToast()
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [next, setNext] = useState(null)
  const [previous, setPrevious] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})

  const [students, setStudents] = useState([])
  const [customOpen, setCustomOpen] = useState(false)
  const [customStudent, setCustomStudent] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [sending, setSending] = useState(false)

  const fetchHistory = useCallback(() => {
    setLoading(true)
    smsService.history({ page, ...filters })
      .then((res) => {
        setRows(res.data.results ?? res.data)
        setCount(res.data.count ?? (res.data.length || 0))
        setNext(res.data.next)
        setPrevious(res.data.previous)
      })
      .catch((err) => addToast(err.friendlyMessage || 'Failed to load SMS history.', 'error'))
      .finally(() => setLoading(false))
  }, [page, filters])

  useEffect(() => { fetchHistory() }, [fetchHistory])
  useEffect(() => { setPage(1) }, [filters])

  useEffect(() => {
    studentService.list({ page_size: 500 }).then((res) => setStudents(res.data.results ?? res.data))
  }, [])

  const counts = {
    sent: rows.filter((r) => r.status === 'SENT').length,
    failed: rows.filter((r) => r.status === 'FAILED').length,
    pending: rows.filter((r) => r.status === 'PENDING').length,
  }

  const handleSendCustom = async () => {
    if (!customStudent || !customMessage.trim()) return
    setSending(true)
    try {
      await smsService.sendOne({ student_id: customStudent, message: customMessage })
      addToast('Custom SMS sent.')
      setCustomOpen(false)
      setCustomStudent('')
      setCustomMessage('')
      fetchHistory()
    } catch (err) {
      addToast(err.friendlyMessage || 'Unable to send SMS. Please check the SMS service and try again.', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashboardCard label="Sent" value={counts.sent} icon={MessageSquareText} tone="forest" />
        <DashboardCard label="Failed" value={counts.failed} icon={MessageSquareX} tone="brick" />
        <DashboardCard label="Pending" value={counts.pending} icon={Clock} tone="maize" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          filters={[
            { name: 'status', label: 'All Status', options: ['SENT', 'FAILED', 'PENDING'] },
            { name: 'message_type', label: 'All Types', options: [
              { value: 'DEBT_REMINDER', label: 'Debt Reminder' },
              { value: 'COMPLETION', label: 'Completion' },
              { value: 'CUSTOM', label: 'Custom' },
            ] },
          ]}
          values={filters}
          onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value }))}
        />
        <button className="btn-primary" onClick={() => setCustomOpen(true)}>
          <Send size={16} /> Custom SMS
        </button>
      </div>

      <div className="card overflow-hidden">
        <SMSHistoryTable rows={rows} loading={loading} />
        {!loading && rows.length > 0 && (
          <Pagination page={page} hasNext={!!next} hasPrevious={!!previous} onPageChange={setPage} totalCount={count} />
        )}
      </div>

      <ConfirmationModal
        open={customOpen}
        title="Send Custom SMS"
        confirmLabel={sending ? 'Sending...' : 'Send SMS'}
        onCancel={() => setCustomOpen(false)}
        onConfirm={handleSendCustom}
        loading={sending}
      >
        <div className="space-y-3 text-left">
          <div>
            <label className="label">Student</label>
            <select className="input" value={customStudent} onChange={(e) => setCustomStudent(e.target.value)}>
              <option value="">Select a student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.student_id} — {s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input" rows={3} value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} placeholder="Type your custom message..." />
          </div>
        </div>
      </ConfirmationModal>
    </div>
  )
}
