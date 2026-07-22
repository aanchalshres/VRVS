'use client'
import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '@/app/lib/api'
import { ShieldCheck, Upload, FileText, Trash2, Download, AlertTriangle } from 'lucide-react'

interface Document {
  id: number
  document_type: string
  original_name: string
  file_name: string
  file_path: string
  mime_type: string
  file_size: number
  status: string
  reviewed_by: number | null
  reviewed_at: string | null
  remarks: string | null
  created_at: string
}

interface Profile {
  verification_status: string
  rejection_reason: string | null
}

const DOC_TYPES = [
  { value: 'registration_certificate', label: 'Registration Certificate' },
  { value: 'pan_document', label: 'PAN Document' },
  { value: 'letterhead', label: 'Letterhead' },
  { value: 'other', label: 'Other' },
]

const DOC_TYPE_LABELS: Record<string, string> = {
  registration_certificate: 'Registration Certificate',
  pan_document: 'PAN Document',
  letterhead: 'Letterhead',
  other: 'Other',
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function NGOVerificationPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState('registration_certificate')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const [docRes, profileRes] = await Promise.all([
        apiGet<{ data: Document[] }>('/api/ngo/documents'),
        apiGet<{ data: Profile }>('/api/ngo/profile'),
      ])
      setDocuments(docRes.data)
      setProfile(profileRes.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(null)
    try {
      const fd = new FormData()
      fd.append('document', file)
      fd.append('document_type', selectedType)
      await apiPost('/api/ngo/documents', fd as any)
      setSuccess('Document uploaded')
      load()
    } catch (err: any) {
      setError(err.message || 'Failed to upload')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return
    try {
      await apiDelete(`/api/ngo/documents/${id}`)
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      setSuccess('Document deleted')
    } catch (err: any) {
      setError(err.message || 'Failed to delete')
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    verified: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
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
        <h1 className="text-2xl font-bold text-gray-900">Verification Documents</h1>
        <p className="text-sm text-[#6B7280]">
          Upload documents for NGO verification. Status:{' '}
          <span className={`font-semibold ${profile?.verification_status === 'verified' ? 'text-green-600' : profile?.verification_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
            {profile?.verification_status || 'pending'}
          </span>
        </p>
        {profile?.rejection_reason && (
          <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded p-3 mt-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>Rejection reason: {profile.rejection_reason}</span>
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded p-3">{error}</div>}
      {success && <div className="bg-green-50 border-l-4 border-green-400 text-green-700 text-sm rounded p-3">{success}</div>}

      {profile?.verification_status === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck size={24} className="text-green-600" />
          <div>
            <p className="font-semibold text-green-800">Organization Verified</p>
            <p className="text-sm text-green-600">Your NGO has been verified. No further documents required.</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-black/5 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Upload New Document</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8]"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {DOC_TYPES.map((dt) => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
          </select>
          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#4F46C8] hover:bg-[#4338CA] transition cursor-pointer ${uploading ? 'opacity-60' : ''}`}>
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Choose File'}
            <input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        <p className="text-xs text-[#6B7280] mt-2">Accepted: JPG, PNG, PDF, DOC (max 10MB)</p>
      </div>

      <div className="space-y-3">
        {documents.length === 0 && (
          <div className="bg-white border border-black/5 rounded-xl p-10 text-center">
            <FileText size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No documents uploaded</p>
            <p className="text-sm text-gray-400 mt-1">Upload your registration certificate, PAN document, or letterhead for verification.</p>
          </div>
        )}
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white border border-black/5 rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#EEF0FF] flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-[#4F46C8]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{DOC_TYPE_LABELS[doc.document_type] || doc.document_type}</p>
                  <p className="text-xs text-[#6B7280] truncate">{doc.original_name} ({formatSize(doc.file_size)})</p>
                  <p className="text-xs text-[#6B7280]">{timeAgo(doc.created_at)}</p>
                  {doc.remarks && <p className="text-xs text-red-500 mt-1">Admin remark: {doc.remarks}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                  {doc.status}
                </span>
                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000'}/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="p-2 text-[#6B7280] hover:text-[#4F46C8] transition" title="Download">
                  <Download size={16} />
                </a>
                {doc.status !== 'verified' && (
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-[#6B7280] hover:text-red-500 transition" title="Delete">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
