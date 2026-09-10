import { useState, useEffect, useMemo } from 'react'
import { MONTHS, formatTSh, formatKG } from '../utils/format.js'

const emptyForm = {
  student: '', month: 'SEPTEMBER', year: new Date().getFullYear(),
  mahindi_submitted: 0, mboga_submitted: 0, cash_submitted: 0,
  recorded_date: new Date().toISOString().slice(0, 10), notes: '',
}

export default function ContributionForm({ students, requirements, onSubmit, submitting, error, duplicateWarning }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { setForm(emptyForm) }, [])

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const required = requirements || { mahindi_requirement: 10, mboga_requirement: 5, cash_requirement: 15000 }

  const mahindiRemaining = Math.max(0, required.mahindi_requirement - (Number(form.mahindi_submitted) || 0))
  const mbogaRemaining = Math.max(0, required.mboga_requirement - (Number(form.mboga_submitted) || 0))
  const cashRemaining = Math.max(0, required.cash_requirement - (Number(form.cash_submitted) || 0))
  const status = (mahindiRemaining > 0 || mbogaRemaining > 0 || cashRemaining > 0) ? 'HAS DEBT' : 'COMPLETED'

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <form onSubmit={handleSubmit} className="card space-y-4 p-5 lg:col-span-2">
        {error && <div className="rounded-lg bg-brick-50 px-3 py-2 text-sm text-brick-600">{error}</div>}
        {duplicateWarning && (
          <div className="rounded-lg bg-maize-50 px-3 py-2 text-sm text-maize-600">
            This student already has a contribution record for this month.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Student</label>
            <select required className="input" value={form.student} onChange={(e) => handleChange('student', e.target.value)}>
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.student_id} — {s.full_name} ({s.class_name} {s.stream})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Month</label>
            <select className="input" value={form.month} onChange={(e) => handleChange('month', e.target.value)}>
              {MONTHS.map((m) => <option key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <input type="number" className="input" value={form.year} onChange={(e) => handleChange('year', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Mahindi Submitted (KG)</label>
            <input type="number" min="0" step="0.1" className="input" value={form.mahindi_submitted} onChange={(e) => handleChange('mahindi_submitted', e.target.value)} />
          </div>
          <div>
            <label className="label">Mboga Submitted (KG)</label>
            <input type="number" min="0" step="0.1" className="input" value={form.mboga_submitted} onChange={(e) => handleChange('mboga_submitted', e.target.value)} />
          </div>
          <div>
            <label className="label">Cash Submitted (TSh)</label>
            <input type="number" min="0" step="500" className="input" value={form.cash_submitted} onChange={(e) => handleChange('cash_submitted', e.target.value)} />
          </div>
          <div>
            <label className="label">Date Recorded</label>
            <input type="date" className="input" value={form.recorded_date} onChange={(e) => handleChange('recorded_date', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Contribution'}
          </button>
        </div>
      </form>

      <div className="card space-y-5 p-5">
        <h3 className="font-display text-sm font-semibold text-ink">Live Calculation</h3>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Mahindi</p>
          <div className="space-y-0.5 text-sm">
            <p className="flex justify-between"><span className="text-muted">Required</span><span>{formatKG(required.mahindi_requirement)}</span></p>
            <p className="flex justify-between"><span className="text-muted">Submitted</span><span>{formatKG(form.mahindi_submitted)}</span></p>
            <p className="flex justify-between font-semibold"><span>Remaining</span><span className={mahindiRemaining > 0 ? 'text-brick-600' : 'text-forest-700'}>{formatKG(mahindiRemaining)}</span></p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Mboga</p>
          <div className="space-y-0.5 text-sm">
            <p className="flex justify-between"><span className="text-muted">Required</span><span>{formatKG(required.mboga_requirement)}</span></p>
            <p className="flex justify-between"><span className="text-muted">Submitted</span><span>{formatKG(form.mboga_submitted)}</span></p>
            <p className="flex justify-between font-semibold"><span>Remaining</span><span className={mbogaRemaining > 0 ? 'text-brick-600' : 'text-forest-700'}>{formatKG(mbogaRemaining)}</span></p>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Fedha</p>
          <div className="space-y-0.5 text-sm">
            <p className="flex justify-between"><span className="text-muted">Required</span><span>{formatTSh(required.cash_requirement)}</span></p>
            <p className="flex justify-between"><span className="text-muted">Submitted</span><span>{formatTSh(form.cash_submitted)}</span></p>
            <p className="flex justify-between font-semibold"><span>Remaining</span><span className={cashRemaining > 0 ? 'text-brick-600' : 'text-forest-700'}>{formatTSh(cashRemaining)}</span></p>
          </div>
        </div>

        <div className={`rounded-lg px-3 py-2.5 text-center text-sm font-semibold ${status === 'HAS DEBT' ? 'bg-brick-50 text-brick-600' : 'bg-forest-50 text-forest-700'}`}>
          STATUS: {status}
        </div>
      </div>
    </div>
  )
}
