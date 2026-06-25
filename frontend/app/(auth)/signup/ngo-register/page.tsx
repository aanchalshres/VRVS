'use client'

import Navbar from '@/app/components/Navbar'
import { Button } from '@/app/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NGORegister() {
  const router = useRouter()

  const [form, setForm] = useState({
    organization_name: '',
    registration_number: '',
    description: '',
    website: '',
    address: '',
    city: '',
    country: '',
  })

  const [logo, setLogo] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.organization_name) {
      setError('Organization Name is required')
      return
    }

    setError('')
    setLoading(true)

    const ngoData = {
      // BIGINT PK
      id: Date.now(),

      // BIGINT FK -> users.id
      // Placeholder until authentication/API is connected
      user_id: null,

      // VARCHAR
      organization_name: form.organization_name,

      // VARCHAR NULL
      registration_number:
        form.registration_number || null,

      // TEXT NULL
      description: form.description || null,

      // VARCHAR NULL
      // Placeholder until file upload API is connected
      logo: logo ? logo.name : null,

      // VARCHAR NULL
      website: form.website || null,

      // TEXT NULL
      address: form.address || null,

      // VARCHAR NULL
      city: form.city || null,

      // VARCHAR NULL
      country: form.country || null,

      // ENUM(pending, approved, rejected)
      verification_status: 'pending',

      // BIGINT NULL FK -> users.id
      verified_by: null,

      // TIMESTAMP NULL
      verified_at: null,

      // TEXT NULL
      rejection_reason: null,

      // TIMESTAMPS
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    try {
      /*
       * TODO: API Integration
       *
       * const response = await fetch('/api/ngos', {
       *   method: 'POST',
       *   headers: {
       *     'Content-Type': 'application/json',
       *   },
       *   body: JSON.stringify(ngoData),
       * })
       */

      // Temporary localStorage fallback
      const existing = JSON.parse(
        localStorage.getItem('ngos') || '[]'
      )

      localStorage.setItem(
        'ngos',
        JSON.stringify([ngoData, ...existing])
      )

      alert('NGO Registered Successfully')

      router.push('/dashboard/ngo')
    } catch (err) {
      setError('Registration failed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3]">
      <Navbar />

      <div className="flex items-center justify-center py-10">
        <Card className="w-full max-w-md bg-white shadow-xl">
               <CardHeader className="space-y-3 px-4 pt-6 text-center sm:px-6">
            <div className="flex justify-center">
              <img
                src="/logo1.png"
                alt="Logo"
                className="h-20 w-20 object-contain"
              />
            </div>
          </CardHeader>
           <CardTitle className="text-2xl text-[#4F46C8] text-center">
              NGO Registration
            </CardTitle>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <Label>Organization Name *</Label>
                <Input
                  value={form.organization_name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      organization_name: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Registration Number</Label>
                <Input
                  value={form.registration_number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      registration_number:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Website</Label>
                <Input
                  value={form.website}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      website: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  value={form.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      city: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Country</Label>
                <Input
                  value={form.country}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      country: e.target.value,
                    })
                  }
                />
              </div>

              

              {error && (
                <p className="text-red-500 text-sm">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#4F46C8] text-white"
                disabled={loading}
              >
                {loading
                  ? 'Registering...'
                  : 'Register NGO'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}