'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers/AuthProvider'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import { FileText, Download, Building2 } from 'lucide-react'
import { apiGet } from '@/app/lib/api'

interface NGOProfile {
  id: string
  organization_name: string
  registration_number: string
  description: string
  logo?: string
  website?: string
  address?: string
  city?: string
  country?: string
  verification_status?: 'pending' | 'approved' | 'rejected'
  verified_by?: string
  verified_at?: string
  rejection_reason?: string
  created_at?: string
  updated_at?: string

  user?: {
    name: string
    email: string
    phone: string
  }
}

export default function NGOProfilePage() {
  const { user } = useAuth()

  const [profile, setProfile] = useState<NGOProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        // TODO: API integration
        const ngoProfile = await apiGet<NGOProfile>(
          '/api/ngo/profile'
        )

        setProfile(ngoProfile)
      } catch (err) {
        console.error(err)
        setError('Failed to load NGO profile. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
      </div>
    )
  }

  // ERROR
  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        {error}
      </div>
    )
  }

  // NO PROFILE
  if (!profile) {
    return (
      <div className="p-6 text-center text-[#6B7280]">
        NGO profile not found
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-[#111827]">
          Organization Profile
        </h1>
        <p className="text-[#6B7280]">
          View your NGO profile details
        </p>
      </div>

      {/* MAIN CARD */}
      <Card className="bg-white border border-[#CACDD3]">

        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46C8] to-[#3730A3]">
              <Building2 className="h-6 w-6 text-white" />
            </div>

            <div>
              <CardTitle className="text-2xl text-[#111827]">
                {profile.organization_name}
              </CardTitle>

              <p className="text-sm text-[#6B7280] mt-1">
                Status:{' '}
                <span className="font-semibold capitalize text-green-600">
                  {profile.verification_status || 'pending'}
                </span>
              </p>
            </div>

          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* ORGANIZATION INFO */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[#111827]">
              Organization Information
            </h3>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <p className="text-xs text-[#6B7280]">
                  Organization Name
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.organization_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280]">
                  Registration Number
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.registration_number || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280]">
                  Description
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.description || 'No description provided'}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280]">
                  Website
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.website || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280]">
                  Address
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.address || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280]">
                  City
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.city || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280]">
                  Country
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.country || 'N/A'}
                </p>
              </div>

            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="border-t border-[#CACDD3] pt-6">
            <h3 className="mb-4 text-sm font-semibold text-[#111827]">
              Contact Information
            </h3>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <p className="text-xs text-[#6B7280]">
                  Contact Person
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.user?.name || 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#6B7280]">
                  Email
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.user?.email || 'N/A'}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-xs text-[#6B7280]">
                  Phone
                </p>
                <p className="text-sm font-medium text-[#111827]">
                  {profile.user?.phone || 'N/A'}
                </p>
              </div>

            </div>
          </div>

          {/* DOCUMENTS */}
          <div className="border-t border-[#CACDD3] pt-6">

            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#111827]">
              <FileText className="h-4 w-4 text-[#4F46C8]" />
              Documents
            </h3>

            <p className="text-sm text-[#6B7280]">
              Document upload feature will be available after API integration.
            </p>

          </div>

        </CardContent>
      </Card>
    </div>
  )
}