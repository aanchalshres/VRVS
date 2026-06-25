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

export default function VolunteerLogin() {
  const router = useRouter()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    const loginData = {
      email: form.email,
      password: form.password,
      role: 'volunteer',
    }

    try {
      /*
        TODO: API Integration
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        })
      */

      // 🔹 Local fallback (same storage used in register)
      const users = JSON.parse(localStorage.getItem('users') || '[]')

      const user = users.find(
        (u: any) =>
          u.email === form.email &&
          u.password === form.password &&
          u.role === 'volunteer'
      )

      if (!user) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      localStorage.setItem('authUser', JSON.stringify(user))
      localStorage.setItem('role', 'volunteer')

      alert('Login successful 🚀')

      router.push('/volunteer/tasks')
    } catch (err) {
      console.error(err)
      setError('Login failed')
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
            Volunteer Login
          </CardTitle>
        </CardHeader>

        {/* BODY */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
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
              {loading ? 'Logging in...' : 'Login Volunteer'}
            </Button>

          </form>
        </CardContent>

      </Card>

    </div>
  )
}