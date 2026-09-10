import { useEffect, useState, useCallback } from 'react'
import { Save, RefreshCw, Plus, Download, Upload, FileSpreadsheet, FileText } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

import contributionService from '../services/contributionService.js'
import studentService from '../services/studentService.js'
import settingsService from '../services/settingsService.js'
import Spreadsheet from '../components/Spreadsheet.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useToast } from '../hooks/useToast.jsx'

export default function SpreadsheetPage() {
  const { addToast } = useToast()
  const [rows, setRows] = useState([])
  const [students, setStudents] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirtyIds, setDirtyIds] = useState(new Set())

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [spreadsheetRes, studentsRes, settingsRes] = await Promise.all([
        contributionService.spreadsheet({ page_size: 500 }),
        studentService.list({ page_size: 500 }),
        settingsService.get(),
      ])
      setRows((spreadsheetRes.data.results ?? spreadsheetRes.data).map((r) => ({ ...r })))
      setStudents(studentsRes.data.results ?? studentsRes.data)
      setSettings(settingsRes.data)
    } catch (err) {
      addToast(err.friendlyMessage || 'Failed to load spreadsheet data.', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCellEdited = (updatedRow) => {
    setRows((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)))
    setDirtyIds((prev) => new Set(prev).add(updatedRow.id))
  }

  const handleAddRow = () => {
    if (students.length === 0) {
      addToast('Add a student first before creating a contribution row.', 'error')
      return
    }
    const s = students[0]
    const tempId = `new-${Date.now()}`
    setRows((prev) => [{
      id: tempId, _tempId: tempId, student: s.id,
      student_id: s.student_id, student_name: s.full_name,
      class_name: s.class_name, stream: s.stream,
      guardian_name: s.guardian_name, guardian_phone: s.guardian_phone,
      month: 'SEPTEMBER', year: new Date().getFullYear(),
      mahindi_required: settings?.mahindi_requirement ?? 10, mahindi_submitted: 0, mahindi_debt: settings?.mahindi_requirement ?? 10,
      mboga_required: settings?.mboga_requirement ?? 5, mboga_submitted: 0, mboga_debt: settings?.mboga_requirement ?? 5,
      cash_required: settings?.cash_requirement ?? 15000, cash_submitted: 0, cash_debt: settings?.cash_requirement ?? 15000,
      status: 'HAS_DEBT', sms_status: 'NOT_SENT', recorded_date: new Date().toISOString().slice(0, 10), notes: '',
    }, ...prev])
  }

  const handleDeleteRow = async (row) => {
    if (typeof row.id === 'string' && row.id.startsWith('new-')) {
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      return
    }
    try {
      await contributionService.remove(row.id)
      setRows((prev) => prev.filter((r) => r.id !== row.id))
      addToast('Row deleted.')
    } catch (err) {
      addToast(err.friendlyMessage || 'Unable to delete row.', 'error')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const newRows = rows.filter((r) => typeof r.id === 'string' && r.id.startsWith('new-'))
      const existingDirty = rows.filter((r) => dirtyIds.has(r.id) && !(typeof r.id === 'string' && r.id.startsWith('new-')))

      for (const row of newRows) {
        await contributionService.create({
          student: row.student, month: row.month, year: row.year,
          mahindi_submitted: row.mahindi_submitted, mboga_submitted: row.mboga_submitted,
          cash_submitted: row.cash_submitted, recorded_date: row.recorded_date, notes: row.notes,
        })
      }

      if (existingDirty.length > 0) {
        await contributionService.bulkUpdate(existingDirty.map((r) => ({
          id: r.id, mahindi_submitted: r.mahindi_submitted, mboga_submitted: r.mboga_submitted,
          cash_submitted: r.cash_submitted, recorded_date: r.recorded_date, notes: r.notes,
        })))
      }

      addToast('Spreadsheet saved successfully.')
      setDirtyIds(new Set())
      loadData()
    } catch (err) {
      addToast(err.friendlyMessage || 'Unable to save spreadsheet.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const exportCSV = () => {
    const csv = Papa.unparse(rows.map(({ id, _tempId, student, ...rest }) => rest))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mkalapa_contributions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rows.map(({ id, _tempId, student, ...rest }) => rest))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Contributions')
    XLSX.writeFile(wb, 'mkalapa_contributions.xlsx')
  }

  const downloadTemplate = () => {
    const template = [{
      student_id: 'MK001', month: 'SEPTEMBER', year: 2026,
      mahindi_submitted: 7, mboga_submitted: 3, cash_submitted: 10000,
      recorded_date: '2026-09-05', notes: '',
    }]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'mkalapa_import_template.xlsx')
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const processRows = (imported) => {
      const errors = []
      imported.forEach((row, idx) => {
        if (!row.student_id) errors.push(`Row ${idx + 1}: Student ID is required.`)
        if (row.mahindi_submitted < 0) errors.push(`Row ${idx + 1}: Mahindi quantity cannot be negative.`)
        if (row.mboga_submitted < 0) errors.push(`Row ${idx + 1}: Mboga quantity cannot be negative.`)
        if (row.cash_submitted < 0) errors.push(`Row ${idx + 1}: Cash amount cannot be negative.`)
      })
      if (errors.length > 0) {
        addToast(`Import validation failed: ${errors[0]}${errors.length > 1 ? ` (+${errors.length - 1} more)` : ''}`, 'error')
        return
      }
      addToast(`Import preview: ${imported.length} rows validated. Review and click Save to persist.`)
      const mapped = imported.map((row, idx) => {
        const student = students.find((s) => s.student_id === row.student_id)
        const tempId = `new-${Date.now()}-${idx}`
        return {
          id: tempId, _tempId: tempId, student: student?.id,
          student_id: row.student_id, student_name: student?.full_name || row.student_id,
          class_name: student?.class_name || '', stream: student?.stream || '',
          guardian_name: student?.guardian_name || '', guardian_phone: student?.guardian_phone || '',
          month: row.month, year: row.year,
          mahindi_required: settings?.mahindi_requirement ?? 10, mahindi_submitted: Number(row.mahindi_submitted) || 0,
          mboga_required: settings?.mboga_requirement ?? 5, mboga_submitted: Number(row.mboga_submitted) || 0,
          cash_required: settings?.cash_requirement ?? 15000, cash_submitted: Number(row.cash_submitted) || 0,
          recorded_date: row.recorded_date || new Date().toISOString().slice(0, 10), notes: row.notes || '',
          sms_status: 'NOT_SENT',
        }
      })
      setRows((prev) => [...mapped, ...prev])
    }

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, { header: true, dynamicTyping: true, complete: (res) => processRows(res.data.filter((r) => r.student_id)) })
    } else {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target.result, { type: 'binary' })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(sheet)
        processRows(json)
      }
      reader.readAsBinaryString(file)
    }
    e.target.value = ''
  }

  if (loading) return <LoadingSpinner label="Loading spreadsheet..." fullPage />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-ink">Embedded Contribution Spreadsheet</h2>
          <p className="text-xs text-muted">Edit submitted amounts directly. Debt & status calculate automatically.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={handleAddRow}><Plus size={16} /> Add Row</button>
          <button className="btn-secondary" onClick={loadData}><RefreshCw size={16} /> Refresh</button>
          <button className="btn-secondary" onClick={downloadTemplate}><FileText size={16} /> Template</button>
          <label className="btn-secondary cursor-pointer">
            <Upload size={16} /> Import
            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
          </label>
          <button className="btn-secondary" onClick={exportCSV}><Download size={16} /> CSV</button>
          <button className="btn-secondary" onClick={exportExcel}><FileSpreadsheet size={16} /> Excel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden p-2">
        <Spreadsheet rows={rows} onCellEdited={handleCellEdited} onDeleteRow={handleDeleteRow} students={students} />
      </div>
    </div>
  )
}
