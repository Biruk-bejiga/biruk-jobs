import PropTypes from 'prop-types'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const QuickApplyModal = ({ job, open, onClose, onApplied }) => {
  const { authFetchJson, user } = useAuth()
  const [resumeUrl, setResumeUrl] = useState('')
  const [cover, setCover] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.info('Please sign in to apply')
      return
    }

    setIsSubmitting(true)
    try {
      const body = {}
      if (resumeUrl.trim()) body.resumeUrl = resumeUrl.trim()
      if (cover.trim()) body.cover = cover.trim()

      await authFetchJson(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      toast.success('Application submitted')
      onApplied && onApplied()
      onClose()
    } catch (err) {
      toast.error(err?.message ?? 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <header className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Quick apply — {job.title}</h3>
            <p className="mt-1 text-sm text-slate-500">Provide a résumé link and a short cover note.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Résumé link (optional)</label>
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">A public link to your résumé or portfolio (optional).</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Cover note (optional)</label>
            <textarea
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              rows={4}
              placeholder="Write a short note to the employer…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

QuickApplyModal.propTypes = {
  job: PropTypes.object.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onApplied: PropTypes.func,
}

QuickApplyModal.defaultProps = {
  open: false,
  onApplied: null,
}

export default QuickApplyModal
