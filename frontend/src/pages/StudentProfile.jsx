import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, User } from 'lucide-react'

import studentService from '../services/studentService.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { formatTSh, formatKG, monthLabel, statusBadgeClass, statusLabel } from '../utils/format.js'

export default function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    studentService.profile(id)
      .then((res) => { if (mounted) setData(res.data) })
      .catch((err) => { if (mounted) setError(err.friendlyMessage || 'Student not found.') })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [id])

  if (loading) return <LoadingSpinner label="Loading student..." fullPage />
  if (error || !data) return <EmptyState title="Student not found" description={error} />

  const { student, contributions, current_debt, sms_history } = data

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/students')} className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} /> Back to Students
      </button>

      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">{student.full_name}</h2>
            <p className="text-sm text-muted">{student.student_id} · {student.class_name} {student.stream}</p>
          </div>
          <span className={`badge ${student.status === 'ACTIVE' ? 'bg-forest-50 text-forest-700' : 'bg-canvas text-muted'}`}>
            {student.status}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-2.5">
            <User size={16} className="mt-0.5 text-muted" />
            <div>
              <p className="text-xs text-muted">Parent / Guardian</p>
              <p className="text-sm font-medium text-ink">{student.guardian_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone size={16} className="mt-0.5 text-muted" />
            <div>
              <p className="text-xs text-muted">Phone</p>
              <p className="text-sm font-medium text-ink">{student.guardian_phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <MapPin size={16} className="mt-0.5 text-muted" />
            <div>
              <p className="text-xs text-muted">Address</p>
              <p className="text-sm font-medium text-ink">{student.address || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {current_debt && (
        <div className="card p-5">
          <h3 className="mb-3 font-display text-sm font-semibold text-ink">Current Debt — {monthLabel(current_debt.month)} {current_debt.year}</h3>
          <div className="flex flex-wrap items-center gap-4">
            <span className={statusBadgeClass(current_debt.status)}>{statusLabel(current_debt.status)}</span>
            {current_debt.mahindi_debt > 0 && <span className="text-sm text-ink">Mahindi: {formatKG(current_debt.mahindi_debt)}</span>}
            {current_debt.mboga_debt > 0 && <span className="text-sm text-ink">Mboga: {formatKG(current_debt.mboga_debt)}</span>}
            {current_debt.cash_debt > 0 && <span className="text-sm text-ink">Cash: {formatTSh(current_debt.cash_debt)}</span>}
            {current_debt.status === 'COMPLETED' && <span className="text-sm text-muted">No outstanding contribution.</span>}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-ink">Monthly Contribution History</h3>
        </div>
        {contributions.length === 0 ? (
          <EmptyState title="No contribution records found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-canvas/60 text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Mahindi</th>
                  <th className="px-4 py-3">Mboga</th>
                  <th className="px-4 py-3">Cash</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contributions.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">{monthLabel(c.month)} {c.year}</td>
                    <td className="px-4 py-3">{c.mahindi_submitted}/{c.mahindi_required} KG</td>
                    <td className="px-4 py-3">{c.mboga_submitted}/{c.mboga_required} KG</td>
                    <td className="px-4 py-3">{formatTSh(c.cash_submitted)}/{formatTSh(c.cash_required)}</td>
                    <td className="px-4 py-3"><span className={statusBadgeClass(c.status)}>{statusLabel(c.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-display text-sm font-semibold text-ink">SMS History</h3>
        </div>
        {sms_history.length === 0 ? (
          <EmptyState title="No SMS messages found." />
        ) : (
          <div className="divide-y divide-border">
            {sms_history.map((s) => (
              <div key={s.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">{s.message_type.replace('_', ' ')}</p>
                  <span className={statusBadgeClass(s.status)}>{statusLabel(s.status)}</span>
                </div>
                <p className="mt-1 text-sm text-ink">{s.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
