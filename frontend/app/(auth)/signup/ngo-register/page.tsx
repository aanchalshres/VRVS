'use client'

import Navbar from '@/app/components/Navbar'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NGORegister() {
  const router = useRouter()

  const [form, setForm] = useState({
    organizationName: '',
    email: '',
    phone: '',
    password: '',
    officeLocation: '',
    registrationNumber: '',
    panNumber: '',
  })

  const [registrationFile, setRegistrationFile] = useState<File | null>(null)
  const [panFile, setPanFile] = useState<File | null>(null)
  const [letterhead, setLetterhead] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !form.organizationName ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.officeLocation ||
      !form.registrationNumber ||
      !form.panNumber ||
      !registrationFile ||
      !panFile
    ) {
      setError('Please fill all required fields')
      return
    }

    setError('')
    setLoading(true)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    const formData = new FormData()
    formData.append('role', 'ngo')
    formData.append('organizationName', form.organizationName)
    formData.append('email', form.email)
    formData.append('phone', form.phone)
    formData.append('password', form.password)
    formData.append('officeLocation', form.officeLocation)
    formData.append('registrationNumber', form.registrationNumber)
    formData.append('panNumber', form.panNumber)

    formData.append('registrationFile', registrationFile)
    formData.append('panFile', panFile)

    if (letterhead) {
      formData.append('letterhead', letterhead)
    }

    fetch(`${apiUrl}/api/register`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Registration failed')
        return res.json()
      })
      .then((data) => {
        setLoading(false)

        if (data.access_token || data.token) {
          const token = data.access_token || data.token
          const user = data.user

          localStorage.setItem('authToken', token)
          localStorage.setItem('user', JSON.stringify(user))

          document.cookie = `token=${token}; path=/`
          document.cookie = `role=ngo; path=/`

          alert('NGO Registered Successfully 🚀')

          router.push('/dashboard/ngo')
        } else {
          setError(data.message || 'Registration failed')
        }
      })
      .catch((err) => {
        setLoading(false)
        setError(err.message)
      })
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3]">
      <Navbar />

      <div className="flex items-center justify-center py-10">
        <Card className="w-full max-w-md bg-white shadow-xl">

          <CardHeader>
            <CardTitle className="text-center text-2xl text-[#4F46C8]">
              NGO Registration
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <Label>Organization Name</Label>
                <Input
                  value={form.organizationName}
                  onChange={(e) =>
                    setForm({ ...form, organizationName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Office Location</Label>
                <Input
                  value={form.officeLocation}
                  onChange={(e) =>
                    setForm({ ...form, officeLocation: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Registration Number</Label>
                <Input
                  value={form.registrationNumber}
                  onChange={(e) =>
                    setForm({ ...form, registrationNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>PAN Number</Label>
                <Input
                  value={form.panNumber}
                  onChange={(e) =>
                    setForm({ ...form, panNumber: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Registration Certificate</Label>
                <Input
                  type="file"
                  onChange={(e) =>
                    setRegistrationFile(e.target.files?.[0] || null)
                  }
                />
              </div>

              <div>
                <Label>PAN Certificate</Label>
                <Input
                  type="file"
                  onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                />
              </div>

              <div>
                <Label>Letterhead (Optional)</Label>
                <Input
                  type="file"
                  onChange={(e) =>
                    setLetterhead(e.target.files?.[0] || null)
                  }
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-[#4F46C8] text-white"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register NGO'}
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}