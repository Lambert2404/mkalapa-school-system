import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import settingsService from '../services/settingsService.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useToast } from '../hooks/useToast.jsx'

export default function SettingsPage() {
  const { addToast } = useToast()
  const [form, setForm] = useState(null)
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([settingsService.get(), settingsService.templates()])
      .then(([settingsRes, templatesRes]) => {
        setForm(settingsRes.data)
        setTemplates(templatesRes.data.results ?? templatesRes.data)
      })
      .catch((err) => addToast(err.friendlyMessage || 'Failed to load settings.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsService.update(form)
      addToast('Settings updated. Future contribution records will use these values.')
    } catch (err) {
      addToast(err.friendlyMessage || 'Unable to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleTemplateChange = (id, value) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, template: value } : t)))
  }

  const saveTemplate = async (template) => {
    try {
      await settingsService.updateTemplate(template.id, { template: template.template })
      addToast(`${template.name} updated.`)
    } catch (err) {
      addToast(err.friendlyMessage || 'Unable to save template.', 'error')
    }
  }

  if (loading || !form) return <LoadingSpinner label="Loading settings..." fullPage />

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="mb-4 font-display text-sm font-semibold text-ink">School Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">School Name</label>
            <input className="input" value={form.school_name} onChange={(e) => handleChange('school_name', e.target.value)} />
          </div>
          <div>
            <label className="label">School Phone</label>
            <input className="input" value={form.school_phone} onChange={(e) => handleChange('school_phone', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">School Address</label>
            <input className="input" value={form.school_address} onChange={(e) => handleChange('school_address', e.target.value)} />
          </div>
          <div>
            <label className="label">SMS Sender Name</label>
            <input className="input" maxLength={11} value={form.sender_name} onChange={(e) => handleChange('sender_name', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-1 font-display text-sm font-semibold text-ink">Monthly Requirements</h3>
        <p className="mb-4 text-xs text-muted">Changes only affect future contribution records — historical records keep the values recorded at the time.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Mahindi Required (KG)</label>
            <input type="number" className="input" value={form.mahindi_requirement} onChange={(e) => handleChange('mahindi_requirement', e.target.value)} />
          </div>
          <div>
            <label className="label">Mboga Required (KG)</label>
            <input type="number" className="input" value={form.mboga_requirement} onChange={(e) => handleChange('mboga_requirement', e.target.value)} />
          </div>
          <div>
            <label className="label">Cash Required (TSh)</label>
            <input type="number" className="input" value={form.cash_requirement} onChange={(e) => handleChange('cash_requirement', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="card p-5">
        <h3 className="mb-1 font-display text-sm font-semibold text-ink">SMS Templates</h3>
        <p className="mb-4 text-xs text-muted">
          Use placeholders: <code>{'{guardian}'}</code> <code>{'{student}'}</code> <code>{'{month}'}</code> <code>{'{year}'}</code> <code>{'{debt_items}'}</code>
        </p>
        <div className="space-y-4">
          {templates.map((t) => (
            <div key={t.id}>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="label !mb-0">{t.name} <span className="text-xs text-muted">({t.type.replace('_', ' ')})</span></label>
                <button className="text-xs font-semibold text-forest-700 hover:underline" onClick={() => saveTemplate(t)}>Save Template</button>
              </div>
              <textarea
                className="input"
                rows={3}
                value={t.template}
                onChange={(e) => handleTemplateChange(t.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
