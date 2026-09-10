import { useEffect, useState, useCallback } from 'react'
import contributionService from '../services/contributionService.js'
import studentService from '../services/studentService.js'
import settingsService from '../services/settingsService.js'
import ContributionForm from '../components/ContributionForm.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import { useToast } from '../hooks/useToast.jsx'

export default function Contributions() {
  const { addToast } = useToast()
  const [students, setStudents] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [duplicateWarning, setDuplicateWarning] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([studentService.list({ page_size: 500 }), settingsService.get()])
      .then(([studentsRes, settingsRes]) => {
        setStudents(studentsRes.data.results ?? studentsRes.data)
        setSettings(settingsRes.data)
      })
      .catch((err) => addToast(err.friendlyMessage || 'Failed to load form data.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    setError(null)
    setDuplicateWarning(false)
    try {
      await contributionService.create(formData)
      addToast('Contribution recorded successfully.')
    } catch (err) {
      const msg = err.friendlyMessage || 'Unable to save contribution.'
      if (msg.toLowerCase().includes('already has a contribution')) {
        setDuplicateWarning(true)
      }
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading..." fullPage />

  return (
    <div>
      <ContributionForm
        students={students}
        requirements={settings}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        duplicateWarning={duplicateWarning}
      />
    </div>
  )
}
