import { useEffect, useState } from 'react'
import ConfirmationModal from './ConfirmationModal.jsx'
import smsService from '../services/smsService.js'

export default function SMSModal({ open, contributionIds, onClose, onSent }) {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && contributionIds?.length > 0) {
      setLoading(true)
      setError(null)
      smsService.preview({ contribution_ids: contributionIds })
        .then((res) => setPreview(res.data))
        .catch((err) => setError(err.friendlyMessage || 'Unable to build preview.'))
        .finally(() => setLoading(false))
    }
  }, [open, contributionIds])

  const handleSend = async () => {
    setSending(true)
    try {
      const res = await smsService.sendBulk({ contribution_ids: contributionIds })
      onSent(res.data)
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to send SMS. Please check the SMS service and try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <ConfirmationModal
      open={open}
      title={`Send SMS to ${preview?.recipient_count ?? contributionIds?.length ?? 0} parents/guardians?`}
      confirmLabel="Send SMS"
      onCancel={onClose}
      onConfirm={handleSend}
      loading={sending}
    >
      {loading && <p>Preparing preview...</p>}
      {error && <p className="text-brick-600">{error}</p>}
      {preview && !loading && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span>Recipients: <strong className="text-ink">{preview.recipient_count}</strong></span>
            <span>SMS to send: <strong className="text-ink">{preview.sms_count}</strong></span>
          </div>
          <div className="rounded-lg bg-canvas p-3 text-xs italic text-ink">
            "{preview.preview_message}"
          </div>
          <p className="text-xs text-muted">Preview shown is a sample; each parent receives a message tailored to their own child's debt.</p>
        </div>
      )}
    </ConfirmationModal>
  )
}
