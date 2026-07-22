'use client'
import { useEffect, useState } from 'react'
import { apiGet, apiPut, apiUpload } from '@/app/lib/api'
import { Building2, Camera, Save, X, ExternalLink } from 'lucide-react'

interface Category {
  id: number
  name: string
}

interface NGOProfile {
  id: number
  organization_name: string
  registration_number: string | null
  description: string | null
  mission: string | null
  vision: string | null
  logo: string | null
  logo_url: string | null
  website: string | null
  social_links: Record<string, string> | null
  office_location: string | null
  city: string | null
  country: string | null
  org_category_id: number | null
  org_category: Category | null
  latitude: number | null
  longitude: number | null
  pan_number: string | null
  verification_status: string
  rejection_reason: string | null
  user: { name: string; email: string; phone: string }
}

export default function NGOProfilePage() {
  const [profile, setProfile] = useState<NGOProfile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    organization_name: '',
    description: '',
    mission: '',
    vision: '',
    website: '',
    office_location: '',
    city: '',
    country: '',
    org_category_id: '',
    latitude: '',
    longitude: '',
    pan_number: '',
    social_links: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [profileRes, catRes] = await Promise.all([
          apiGet<{ data: NGOProfile }>('/api/ngo/profile'),
          apiGet<{ data: Category[] }>('/api/categories').catch(() => ({ data: [] })),
        ])
        const p = profileRes.data
        setProfile(p)
        setCategories(catRes.data || [])
        setForm({
          organization_name: p.organization_name || '',
          description: p.description || '',
          mission: p.mission || '',
          vision: p.vision || '',
          website: p.website || '',
          office_location: p.office_location || '',
          city: p.city || '',
          country: p.country || '',
          org_category_id: p.org_category_id?.toString() || '',
          latitude: p.latitude?.toString() || '',
          longitude: p.longitude?.toString() || '',
          pan_number: p.pan_number || '',
          social_links: p.social_links ? JSON.stringify(p.social_links, null, 2) : '',
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoPreview(URL.createObjectURL(file))
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('logo', file)
      const res = await apiUpload<{ data: { logo: string; logo_url: string } }>('/api/ngo/profile/logo', fd)
      setProfile((prev) => prev ? { ...prev, logo: res.data.logo, logo_url: res.data.logo_url } : prev)
      setSuccess('Logo uploaded')
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo')
    } finally {
      setLogoUploading(false)
      setLogoPreview(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload: Record<string, any> = {
        organization_name: form.organization_name,
        description: form.description,
        mission: form.mission,
        vision: form.vision,
        website: form.website,
        office_location: form.office_location,
        city: form.city,
        country: form.country,
        org_category_id: form.org_category_id ? Number(form.org_category_id) : null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        pan_number: form.pan_number,
      }
      if (form.social_links.trim()) {
        try {
          payload.social_links = JSON.parse(form.social_links)
        } catch {
          payload.social_links = form.social_links
        }
      }
      const res = await apiPut<{ data: NGOProfile }>('/api/ngo/profile', payload)
      setProfile((prev) => prev ? { ...prev, ...res.data } : prev)
      setSuccess('Profile saved')
      setEditMode(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const statusColor: Record<string, string> = {
    verified: 'text-green-600 bg-green-100',
    pending: 'text-yellow-600 bg-yellow-100',
    under_review: 'text-blue-600 bg-blue-100',
    rejected: 'text-red-600 bg-red-100',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  if (error && !profile) {
    return <div className="p-6 text-center text-red-600">{error}</div>
  }

  if (!profile) {
    return <div className="p-6 text-center text-[#6B7280]">Profile not found</div>
  }

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8] focus:ring-1 focus:ring-[#4F46C8]/30 transition'
  const labelClass = 'text-sm font-medium text-gray-700 mb-1 block'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Profile</h1>
          <p className="text-sm text-[#6B7280]">{editMode ? 'Edit your organization details' : 'View your organization details'}</p>
        </div>
        {!editMode && (
          <button onClick={() => setEditMode(true)} className="bg-[#4F46C8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] transition">
            Edit Profile
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded p-3">{error}</div>}
      {success && <div className="bg-green-50 border-l-4 border-green-400 text-green-700 text-sm rounded p-3">{success}</div>}

      <div className="bg-white border border-black/5 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#4F46C8] to-[#3730A3] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {profile.logo_url || logoPreview ? (
                  <img src={logoPreview || profile.logo_url!} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  profile.organization_name?.charAt(0) || 'N'
                )}
              </div>
              {editMode && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl cursor-pointer transition">
                  <Camera size={20} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.organization_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor[profile.verification_status] || 'bg-gray-100 text-gray-600'}`}>
                  {profile.verification_status === 'verified' ? '✓ Verified' : profile.verification_status}
                </span>
                {profile.rejection_reason && (
                  <span className="text-xs text-red-500">Rejected: {profile.rejection_reason}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {editMode ? (
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Organization Name</label>
                <input type="text" className={inputClass} value={form.organization_name} onChange={(e) => setForm({ ...form, organization_name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input type="text" className={inputClass} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea rows={3} className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Mission</label>
                <textarea rows={2} className={inputClass} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Vision</label>
                <textarea rows={2} className={inputClass} value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Office Location</label>
                <input type="text" className={inputClass} value={form.office_location} onChange={(e) => setForm({ ...form, office_location: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Organization Category</label>
                <select className={inputClass} value={form.org_category_id} onChange={(e) => setForm({ ...form, org_category_id: e.target.value })}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input type="text" className={inputClass} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>PAN Number</label>
                <input type="text" className={inputClass} value={form.pan_number} onChange={(e) => setForm({ ...form, pan_number: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Latitude</label>
                <input type="text" className={inputClass} value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Longitude</label>
                <input type="text" className={inputClass} value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Social Links (JSON)</label>
                <textarea rows={3} className={inputClass} value={form.social_links} onChange={(e) => setForm({ ...form, social_links: e.target.value })} placeholder='{"facebook": "...", "twitter": "...", "linkedin": "..."}' />
              </div>
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#4F46C8] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#4338CA] transition disabled:opacity-60">
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditMode(false)} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition">
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Organization Name" value={profile.organization_name} />
              <Field label="Registration Number" value={profile.registration_number || 'N/A'} />
              <div className="md:col-span-2">
                <Field label="Description" value={profile.description || 'No description'} />
              </div>
              <div className="md:col-span-2">
                <Field label="Mission" value={profile.mission || 'No mission'} />
              </div>
              <div className="md:col-span-2">
                <Field label="Vision" value={profile.vision || 'No vision'} />
              </div>
              <Field label="Website" value={profile.website || 'N/A'} />
              <Field label="Category" value={profile.org_category?.name || 'N/A'} />
              <Field label="Office Location" value={profile.office_location || 'N/A'} />
              <Field label="City" value={profile.city || 'N/A'} />
              <Field label="Country" value={profile.country || 'N/A'} />
              <Field label="PAN Number" value={profile.pan_number || 'N/A'} />
              <Field label="Contact Person" value={profile.user?.name || 'N/A'} />
              <Field label="Email" value={profile.user?.email || 'N/A'} />
              <Field label="Phone" value={profile.user?.phone || 'N/A'} />
              {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs text-[#6B7280]">Social Links</p>
                  <div className="flex gap-3 mt-1">
                    {Object.entries(profile.social_links).map(([key, val]) => (
                      <a key={key} href={val as string} target="_blank" rel="noopener noreferrer" className="text-sm text-[#4F46C8] hover:underline flex items-center gap-1">
                        {key} <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#6B7280]">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}
