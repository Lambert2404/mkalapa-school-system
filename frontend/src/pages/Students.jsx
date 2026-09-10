import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'

import studentService from '../services/studentService.js'
import DataTable from '../components/DataTable.jsx'
import SearchBar from '../components/SearchBar.jsx'
import FilterBar from '../components/FilterBar.jsx'
import Pagination from '../components/Pagination.jsx'
import StudentForm from '../components/StudentForm.jsx'
import ConfirmationModal from '../components/ConfirmationModal.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { CLASSES, STREAMS } from '../utils/format.js'

export default function Students() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [students, setStudents] = useState([])
  const [count, setCount] = useState(0)
  const [next, setNext] = useState(null)
  const [previous, setPrevious] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchStudents = useCallback(() => {
    setLoading(true)
    studentService.list({ search, page, ...filters })
      .then((res) => {
        setStudents(res.data.results ?? res.data)
        setCount(res.data.count ?? res.data.length)
        setNext(res.data.next)
        setPrevious(res.data.previous)
      })
      .catch((err) => addToast(err.friendlyMessage || 'Failed to load students.', 'error'))
      .finally(() => setLoading(false))
  }, [search, page, filters])

  useEffect(() => { fetchStudents() }, [fetchStudents])
  useEffect(() => { setPage(1) }, [search, filters])

  const handleFilterChange = (name, value) => setFilters((f) => ({ ...f, [name]: value }))

  const openAddForm = () => { setEditing(null); setFormError(null); setFormOpen(true) }
  const openEditForm = (student) => { setEditing(student); setFormError(null); setFormOpen(true) }

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    setFormError(null)
    try {
      if (editing) {
        await studentService.update(editing.id, formData)
        addToast('Student updated successfully.')
      } else {
        await studentService.create(formData)
        addToast('Student added successfully.')
      }
      setFormOpen(false)
      fetchStudents()
    } catch (err) {
      setFormError(err.friendlyMessage || 'Unable to save student.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await studentService.remove(deleteTarget.id)
      addToast('Student deleted.')
      setDeleteTarget(null)
      fetchStudents()
    } catch (err) {
      addToast(err.friendlyMessage || 'Unable to delete student.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: 'student_id', label: 'ID' },
    { key: 'full_name', label: 'Name' },
    { key: 'class_name', label: 'Class', render: (r) => `${r.class_name} ${r.stream}` },
    { key: 'guardian_name', label: 'Guardian' },
    { key: 'guardian_phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`badge ${r.status === 'ACTIVE' ? 'bg-forest-50 text-forest-700' : 'bg-canvas text-muted'}`}>
        {r.status}
      </span>
    ) },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="rounded p-1.5 hover:bg-canvas" onClick={() => navigate(`/students/${r.id}`)} title="View">
          <Eye size={16} className="text-muted" />
        </button>
        <button className="rounded p-1.5 hover:bg-canvas" onClick={() => openEditForm(r)} title="Edit">
          <Pencil size={16} className="text-muted" />
        </button>
        <button className="rounded p-1.5 hover:bg-brick-50" onClick={() => setDeleteTarget(r)} title="Delete">
          <Trash2 size={16} className="text-brick-500" />
        </button>
      </div>
    ) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, ID, or guardian..." />
          <FilterBar
            filters={[
              { name: 'class_name', label: 'All Classes', options: CLASSES },
              { name: 'stream', label: 'All Streams', options: STREAMS },
              { name: 'gender', label: 'All Genders', options: [{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }] },
              { name: 'status', label: 'All Status', options: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED'] },
            ]}
            values={filters}
            onChange={handleFilterChange}
          />
        </div>
        <button className="btn-primary" onClick={openAddForm}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          rows={students}
          loading={loading}
          emptyTitle="No students found."
          onRowClick={(r) => navigate(`/students/${r.id}`)}
        />
        {!loading && students.length > 0 && (
          <Pagination page={page} hasNext={!!next} hasPrevious={!!previous} onPageChange={setPage} totalCount={count} />
        )}
      </div>

      <StudentForm
        open={formOpen}
        initialData={editing}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={formError}
      />

      <ConfirmationModal
        open={!!deleteTarget}
        title="Delete Student"
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      >
        Are you sure you want to delete <strong>{deleteTarget?.full_name}</strong>? This will also remove their contribution and SMS history.
      </ConfirmationModal>
    </div>
  )
}
