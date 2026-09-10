import { useMemo, useRef, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { MONTHS } from '../utils/format.js'

/**
 * Embedded Excel-like spreadsheet for contribution records.
 * Debt/status columns are computed live client-side for instant feedback;
 * the backend recalculates and remains the source of truth on save.
 */
function computeRow(row) {
  const mahindiDebt = Math.max(0, Number(row.mahindi_required || 0) - Number(row.mahindi_submitted || 0))
  const mbogaDebt = Math.max(0, Number(row.mboga_required || 0) - Number(row.mboga_submitted || 0))
  const cashDebt = Math.max(0, Number(row.cash_required || 0) - Number(row.cash_submitted || 0))
  const status = (mahindiDebt > 0 || mbogaDebt > 0 || cashDebt > 0) ? 'HAS_DEBT' : 'COMPLETED'
  return { ...row, mahindi_debt: mahindiDebt, mboga_debt: mbogaDebt, cash_debt: cashDebt, status }
}

export default function Spreadsheet({ rows, onCellEdited, onDeleteRow, students }) {
  const gridRef = useRef(null)

  const studentOptions = useMemo(() => students.map((s) => s.full_name), [students])
  const studentIdByName = useMemo(() => {
    const map = {}
    students.forEach((s) => { map[s.full_name] = s })
    return map
  }, [students])

  const columnDefs = useMemo(() => [
    { field: 'student_id', headerName: 'Student ID', editable: false, width: 110, pinned: 'left' },
    {
      field: 'student_name', headerName: 'Student Name', editable: true, width: 170, pinned: 'left',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: studentOptions },
    },
    { field: 'class_name', headerName: 'Class', editable: false, width: 110 },
    { field: 'stream', headerName: 'Stream', editable: false, width: 90 },
    { field: 'guardian_name', headerName: 'Parent/Guardian', editable: false, width: 150 },
    { field: 'guardian_phone', headerName: 'Phone', editable: false, width: 130 },
    {
      field: 'month', headerName: 'Month', editable: true, width: 130,
      cellEditor: 'agSelectCellEditor', cellEditorParams: { values: MONTHS },
    },
    { field: 'year', headerName: 'Year', editable: true, width: 90, type: 'numericColumn' },
    { field: 'mahindi_required', headerName: 'Mahindi Req (KG)', editable: false, width: 140 },
    { field: 'mahindi_submitted', headerName: 'Mahindi Sub (KG)', editable: true, width: 140, type: 'numericColumn' },
    { field: 'mahindi_debt', headerName: 'Mahindi Debt (KG)', editable: false, width: 140,
      cellStyle: (p) => p.value > 0 ? { color: '#8F3223', fontWeight: 600 } : {} },
    { field: 'mboga_required', headerName: 'Mboga Req (KG)', editable: false, width: 130 },
    { field: 'mboga_submitted', headerName: 'Mboga Sub (KG)', editable: true, width: 130, type: 'numericColumn' },
    { field: 'mboga_debt', headerName: 'Mboga Debt (KG)', editable: false, width: 130,
      cellStyle: (p) => p.value > 0 ? { color: '#8F3223', fontWeight: 600 } : {} },
    { field: 'cash_required', headerName: 'Cash Req (TSh)', editable: false, width: 130 },
    { field: 'cash_submitted', headerName: 'Cash Sub (TSh)', editable: true, width: 130, type: 'numericColumn' },
    { field: 'cash_debt', headerName: 'Cash Debt (TSh)', editable: false, width: 130,
      cellStyle: (p) => p.value > 0 ? { color: '#8F3223', fontWeight: 600 } : {} },
    {
      field: 'status', headerName: 'Status', editable: false, width: 120,
      cellRenderer: (p) => `<span style="font-weight:600;color:${p.value === 'HAS_DEBT' ? '#8F3223' : '#204A35'}">${p.value === 'HAS_DEBT' ? 'HAS DEBT' : 'COMPLETED'}</span>`,
    },
    { field: 'sms_status', headerName: 'SMS Status', editable: false, width: 110 },
    { field: 'recorded_date', headerName: 'Date Recorded', editable: true, width: 130 },
    { field: 'notes', headerName: 'Notes', editable: true, width: 200 },
  ], [studentOptions])

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), [])

  const onCellValueChanged = useCallback((event) => {
    const updated = computeRow(event.data)
    onCellEdited(updated)
  }, [onCellEdited])

  return (
    <div className="ag-theme-quartz" style={{ width: '100%', height: 560 }}>
      <AgGridReact
        ref={gridRef}
        rowData={rows}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        animateRows
        undoRedoCellEditing
        undoRedoCellEditingLimit={20}
        enableCellTextSelection
        pagination
        paginationPageSize={20}
        getRowId={(params) => String(params.data.id ?? params.data._tempId)}
      />
    </div>
  )
}

export { computeRow }
