import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { CLASSES, STREAMS } from '../utils/format.js'

const emptyForm = {
  student_id: '', full_name: '', gender: 'MALE', date_of_birth: '',
  class_name: 'Form One', stream: 'A', guardian_name: '', guardian_phone: '',
  alternative_phone: '', address: '', status: 'ACTIVE',
}

export default function StudentForm({ open, initialData, onClose, onSubmit, submitting, error }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...emptyForm, ...initialData } : emptyForm)
    }
  }, [open, initialData])

  if (!open) return null

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">
            {initialData ? 'Edit Student' : 'Add Student'}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-ink"><X size={18} /></button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-brick-50 px-3 py-2 text-sm text-brick-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Student ID</label>
            <input required className="input" value={form.student_id} onChange={(e) => handleChange('student_id', e.target.value)} placeholder="MK013" />
          </div>
          <div>
            <label className="label">Full Name</label>
            <input required className="input" value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input type="date" className="input" value={form.date_of_birth || ''} onChange={(e) => handleChange('date_of_birth', e.target.value)} />
          </div>
          <div>
            <label className="label">Class</label>
            <select className="input" value={form.class_name} onChange={(e) => handleChange('class_name', e.target.value)}>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Stream</label>
            <select className="input" value={form.stream} onChange={(e) => handleChange('stream', e.target.value)}>
              {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Parent/Guardian Name</label>
            <input required className="input" value={form.guardian_name} onChange={(e) => handleChange('guardian_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Parent/Guardian Phone</label>
            <input required className="input" placeholder="0712345678" value={form.guardian_phone} onChange={(e) => handleChange('guardian_phone', e.target.value)} />
          </div>
          <div>
            <label className="label">Alternative Phone</label>
            <input className="input" placeholder="0712345678" value={form.alternative_phone || ''} onChange={(e) => handleChange('alternative_phone', e.target.value)} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
              <option value="TRANSFERRED">Transferred</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
          </div>

          <div className="sm:col-span-2 mt-2 flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
