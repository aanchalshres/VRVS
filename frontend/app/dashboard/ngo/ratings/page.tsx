'use client'
import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/app/lib/api'
import { toast } from 'react-hot-toast'
import { Star, User, ThumbsUp, Clock, Briefcase } from 'lucide-react'

interface Review {
  id: number
  rating: number
  review_text: string
  created_at: string
  volunteer_profile: {
    id: number
    user: { name: string }
  }
  task: { title: string }
}

interface EligibleVolunteer {
  id: number
  application_id: number
  volunteer_profile_id: number
  volunteer_name: string
  task_title: string
  hours_contributed: number
}

export default function RatingsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [eligible, setEligible] = useState<EligibleVolunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'give' | 'history'>('give')
  const [form, setForm] = useState({ application_id: 0, rating: 5, review_text: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const [revRes, elRes] = await Promise.all([
        apiGet<{ data: Review[] }>('/api/ngo/ratings'),
        apiGet<{ data: EligibleVolunteer[] }>('/api/ngo/ratings/eligible'),
      ])
      setReviews(revRes.data)
      setEligible(elRes.data)
      if (elRes.data.length > 0) {
        setForm((f) => ({ ...f, application_id: elRes.data[0].application_id }))
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.application_id) { toast.error('Select a volunteer'); return }
    try {
      setSubmitting(true)
      await apiPost('/api/ngo/ratings', {
        application_id: form.application_id,
        rating: form.rating,
        review_text: form.review_text,
      })
      toast.success('Rating submitted!')
      setForm({ application_id: eligible[0]?.application_id || 0, rating: 5, review_text: '' })
      load()
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Ratings</h1>
        <p className="text-sm text-[#6B7280]">Rate volunteers after an opportunity is completed</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button onClick={() => setTab('give')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'give' ? 'border-[#4F46C8] text-[#4F46C8]' : 'border-transparent text-[#6B7280] hover:text-gray-700'}`}>Give Rating</button>
        <button onClick={() => setTab('history')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'history' ? 'border-[#4F46C8] text-[#4F46C8]' : 'border-transparent text-[#6B7280] hover:text-gray-700'}`}>Rating History</button>
      </div>

      {tab === 'give' && (
        <div className="bg-white border border-black/5 rounded-xl p-6">
          {eligible.length === 0 ? (
            <div className="text-center py-8 text-[#6B7280] text-sm">
              <ThumbsUp size={40} className="mx-auto mb-2 text-gray-300" />
              <p>No volunteers eligible for rating yet.</p>
              <p className="text-xs mt-1">After a volunteer completes an opportunity, you can rate them here.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Volunteer</label>
                <select
                  value={form.application_id}
                  onChange={(e) => setForm({ ...form, application_id: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {eligible.map((v) => (
                    <option key={v.application_id} value={v.application_id}>
                      {v.volunteer_name} – {v.task_title} ({v.hours_contributed}h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-1 text-2xl">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })} className={`transition-colors ${star <= form.rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                      <Star size={28} fill={star <= form.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review (optional)</label>
                <textarea
                  value={form.review_text}
                  onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Share your feedback about this volunteer..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#4F46C8] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white border border-black/5 rounded-xl p-6">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-[#6B7280] text-sm">
              <Star size={40} className="mx-auto mb-2 text-gray-300" />
              <p>No ratings given yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="flex items-start justify-between py-3 border-b border-gray-50 text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#6B7280]" />
                      <span className="font-medium text-gray-900">{r.volunteer_profile?.user?.name || 'Volunteer'}</span>
                      <span className="text-yellow-400 flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} />
                        ))}
                      </span>
                    </div>
                    {r.review_text && <p className="text-[#6B7280] mt-1">{r.review_text}</p>}
                    <div className="flex items-center gap-3 text-xs text-[#6B7280] mt-1">
                      <span className="flex items-center gap-1"><Briefcase size={12} />{r.task?.title}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


