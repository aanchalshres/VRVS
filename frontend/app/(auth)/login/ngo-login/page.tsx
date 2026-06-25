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

export default function NGOLogin() {
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
      role: 'ngo',
    }

    try {
      /*
        TODO: API Integration

        const res = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        })
      */

      // 🔹 Temporary fallback (replace later with API response)
      const users = JSON.parse(localStorage.getItem('ngos') || '[]')

      const user = users.find(
        (u: any) =>
          u.email === form.email &&
          u.password === form.password
      )

      if (!user) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      localStorage.setItem('authUser', JSON.stringify(user))
      localStorage.setItem('role', 'ngo')

      alert('Login Successful')

      router.push('/app/dashboard/ngo')
    } catch (err) {
      console.error(err)
      setError('Login failed')
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

            <CardTitle className="text-2xl text-[#4F46C8]">
              NGO Login
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* EMAIL */}
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

              {/* PASSWORD */}
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

              {/* ERROR */}
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              {/* BUTTON */}
              <Button
                type="submit"
                className="w-full bg-[#4F46C8] text-white"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login NGO'}
              </Button>

            </form>
          </CardContent>

        </Card>
      </div>
    </div>
  )
}