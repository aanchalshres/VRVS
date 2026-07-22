'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from "@/app/lib/api"
import {
  Star, Send, CheckCircle, AlertCircle,
  MessageSquare, ThumbsUp, User, Briefcase,
  X, Edit2,
} from 'lucide-react'

interface Review {
  id: number
  rating: number
  comment: string | null
  created_at: string
  reviewer_id: number
  reviewee_id: number
  task_id: number
  reviewer?: { id: number; name: string }
  reviewee?: { id: number; name: string }
  task?: {
    id: number
    title: string
    ngo?: { user?: { name: string }; organization_name?: string }
  }
}

interface EligibleTask {
  task_id: number
  task_title: string
  ngo_name: string
  skills: string[]
}

export default function VolunteerRatingsPage() {
  const [tab, setTab] = useState<'submitted' | 'received' | 'new'>('submitted')

  const [submitted, setSubmitted] = useState<Review[]>([])
  const [received, setReceived] = useState<Review[]>([])
  const [eligibleTasks, setEligibleTasks] = useState<EligibleTask[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')

  const [newTaskId, setNewTaskId] = useState<number | null>(null)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [subRes, recRes, eligibleRes] = await Promise.all([
        apiGet<{ data: Review[] }>('/volunteer/ratings'),
        apiGet<{ data: Review[] }>('/volunteer/ratings/received'),
        apiGet<{ data: EligibleTask[] }>('/volunteer/ratings/eligible'),
      ])
      setSubmitted(subRes.data ?? [])
      setReceived(recRes.data ?? [])
      setEligibleTasks(eligibleRes.data ?? [])
    } catch {
      setToast({ message: 'Failed to load ratings.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSubmitRating = async () => {
    if (!newTaskId) return
    setSubmitting(true)
    try {
      await apiPost('/volunteer/ratings', {
        task_id: newTaskId,
        rating: newRating,
        comment: newComment || null,
      })
      setToast({ message: 'Rating submitted!', type: 'success' })
      setNewTaskId(null)
      setNewRating(5)
      setNewComment('')
      setTab('submitted')
      loadData()
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to submit rating.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateRating = async (id: number) => {
    try {
      await apiPut(`/volunteer/ratings/${id}`, {
        rating: editRating,
        comment: editComment || null,
      })
      setToast({ message: 'Rating updated!', type: 'success' })
      setEditingId(null)
      loadData()
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to update rating.', type: 'error' })
    }
  }

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition`}
        >
          <Star
            size={interactive ? 22 : 16}
            className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F0F1F3] p-6">

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#111827]">Ratings & Feedback</h1>
          <p className="text-sm text-[#6B7280] mt-1">View and manage your ratings.</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(['submitted', 'received', 'new'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === t
                  ? 'bg-[#4F46C8] text-white'
                  : 'bg-white border border-[#CACDD3] text-[#6B7280] hover:border-[#4F46C8]'
              }`}
            >
              {t === 'submitted' && 'My Ratings'}
              {t === 'received' && 'Received'}
              {t === 'new' && 'New Rating'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          </div>
        ) : tab === 'submitted' ? (
          submitted.length === 0 ? (
            <div className="bg-white border border-dashed border-[#CACDD3] rounded-2xl p-12 text-center shadow-sm">
              <MessageSquare className="mx-auto h-10 w-10 text-[#6B7280]" />
              <p className="text-[#111827] font-semibold mt-3">No ratings submitted yet</p>
              <p className="text-[#6B7280] text-sm mt-1">Rate an NGO after completing a task.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submitted.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-[#CACDD3] p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#111827]">
                        {review.reviewee?.name || 'NGO'}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Task: {review.task?.title || 'Unknown'} &middot;
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingId(editingId === review.id ? null : review.id)
                        setEditRating(review.rating)
                        setEditComment(review.comment || '')
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-[#6B7280]"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                  <div className="mt-2">{renderStars(review.rating)}</div>
                  {review.comment && (
                    <p className="text-sm text-[#6B7280] mt-2">{review.comment}</p>
                  )}

                  {editingId === review.id && (
                    <div className="mt-4 pt-4 border-t border-[#CACDD3] space-y-3">
                      <div>
                        <p className="text-sm font-medium text-[#111827] mb-1">Rating</p>
                        {renderStars(editRating, true, setEditRating)}
                      </div>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        placeholder="Update your comment..."
                        className="w-full border border-[#CACDD3] rounded-lg p-2 text-sm focus:outline-none focus:border-[#4F46C8]"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateRating(review.id)}
                          className="px-4 py-2 bg-[#4F46C8] text-white rounded-lg text-sm font-medium hover:bg-[#4F46C8]/90"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 border border-[#CACDD3] rounded-lg text-sm text-[#6B7280] hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : tab === 'received' ? (
          received.length === 0 ? (
            <div className="bg-white border border-dashed border-[#CACDD3] rounded-2xl p-12 text-center shadow-sm">
              <ThumbsUp className="mx-auto h-10 w-10 text-[#6B7280]" />
              <p className="text-[#111827] font-semibold mt-3">No ratings received yet</p>
              <p className="text-[#6B7280] text-sm mt-1">NGOs will rate you after you complete tasks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {received.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-[#CACDD3] p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#111827]">
                        From: {review.reviewer?.name || 'NGO'}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Task: {review.task?.title || 'Unknown'} &middot;
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">{renderStars(review.rating)}</div>
                  {review.comment && (
                    <p className="text-sm text-[#6B7280] mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {eligibleTasks.length === 0 ? (
              <div className="bg-white border border-dashed border-[#CACDD3] rounded-2xl p-12 text-center shadow-sm">
                <CheckCircle className="mx-auto h-10 w-10 text-[#6B7280]" />
                <p className="text-[#111827] font-semibold mt-3">No eligible tasks</p>
                <p className="text-[#6B7280] text-sm mt-1">Complete a task to be able to rate the NGO.</p>
              </div>
            ) : (
              eligibleTasks.map((task) => (
                <div key={task.task_id} className="bg-white rounded-2xl border border-[#CACDD3] p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#111827]">{task.task_title}</p>
                      <p className="text-sm text-[#6B7280] mt-0.5">
                        <User size={14} className="inline mr-1" />
                        {task.ngo_name}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setNewTaskId(task.task_id)
                        setNewRating(5)
                        setNewComment('')
                      }}
                      className="px-4 py-2 bg-[#4F46C8] text-white rounded-lg text-sm font-medium hover:bg-[#4F46C8]/90"
                    >
                      Rate
                    </button>
                  </div>
                  {task.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {task.skills.map((s) => (
                        <span key={s} className="text-xs bg-[#4F46C8]/10 text-[#4F46C8] px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}

                  {newTaskId === task.task_id && (
                    <div className="mt-4 pt-4 border-t border-[#CACDD3] space-y-3">
                      <div>
                        <p className="text-sm font-medium text-[#111827] mb-1">Rating</p>
                        {renderStars(newRating, true, setNewRating)}
                      </div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your feedback (optional)..."
                        className="w-full border border-[#CACDD3] rounded-lg p-2 text-sm focus:outline-none focus:border-[#4F46C8]"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitRating}
                          disabled={submitting}
                          className="flex items-center gap-2 px-4 py-2 bg-[#4F46C8] text-white rounded-lg text-sm font-medium hover:bg-[#4F46C8]/90 disabled:bg-[#4F46C8]/50"
                        >
                          {submitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send size={16} />
                          )}
                          {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                        <button
                          onClick={() => setNewTaskId(null)}
                          className="px-4 py-2 border border-[#CACDD3] rounded-lg text-sm text-[#6B7280] hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
