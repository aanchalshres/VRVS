'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'

export default function VolunteerRegister() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    const userData = {
      id: Date.now(),
      role: 'volunteer',

      name: form.name,
      email: form.email,
      phone: form.phone || null,
      password: form.password,

      email_verified_at: null,
      is_active: true,
      last_login_at: null,
      remember_token: null,

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    }

    try {
      /*
      TODO: API integration
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })
      */

      const existing = JSON.parse(
        localStorage.getItem('users') || '[]'
      )

      localStorage.setItem(
        'users',
        JSON.stringify([userData, ...existing])
      )

      alert('Volunteer registered successfully 🚀')

      router.push('/volunteer/tasks')
    } catch (err) {
      console.error(err)
      setError('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F1F3] flex items-center justify-center p-6">

      <Card className="w-full max-w-md bg-white shadow-xl">

        {/* HEADER */}
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo1.png"
              alt="Logo"
              className="h-20 w-20 object-contain"
            />
          </div>

          <CardTitle className="text-2xl text-[#4F46C8]">
            Volunteer Registration
          </CardTitle>
        </CardHeader>

        {/* BODY */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
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
                : 'Register Volunteer'}
            </Button>

          </form>
        </CardContent>

      </Card>

    </div>
  )
}