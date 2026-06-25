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
import { useToast } from '@/app/hooks/use-toast'

export default function NGORegister() {
  const router = useRouter()
  const { toast } = useToast()

  const [form, setForm] = useState({
    organization_name: '',
    email: '',
    phone: '',
    password: '',
    registration_number: '',
    description: '',
    website: '',
    address: '',
    city: '',
    country: '',
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.organization_name || !form.email || !form.phone || !form.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api$/, '')

      const res = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: form.organization_name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: 'ngo',
          organizationName: form.organization_name,
          registrationNumber: form.registration_number,
          description: form.description,
          website: form.website,
          officeLocation: form.address,
          city: form.city,
          country: form.country,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const description = data.errors
          ? Object.values(data.errors as Record<string, string[]>)[0][0]
          : data.message || 'Registration failed'

        toast({
          title: 'Registration Failed',
          description,
          variant: 'destructive',
        })
        return
      }

      const token = data.token || data.access_token
      const user = data.user

      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))

      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 7)
      document.cookie = `token=${token}; path=/; expires=${expiry.toUTCString()}`
      document.cookie = `role=${user.role}; path=/; expires=${expiry.toUTCString()}`

      window.dispatchEvent(new CustomEvent('auth-updated'))

      router.push('/dashboard/ngo')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3]">
      <Navbar />

      <div className="flex items-center justify-center py-10">
        <Card className="w-full max-w-2xl bg-white shadow-xl">
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
              className="space-y-4 mt-4"
            >
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <Label>Organization Name *</Label>
                  <Input
                    value={form.organization_name}
                    onChange={(e) =>
                      setForm({ ...form, organization_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Registration Number</Label>
                  <Input
                    value={form.registration_number}
                    onChange={(e) =>
                      setForm({ ...form, registration_number: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Website</Label>
                  <Input
                    value={form.website}
                    onChange={(e) =>
                      setForm({ ...form, website: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

              </div>

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