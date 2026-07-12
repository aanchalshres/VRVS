'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { useToast } from '@/app/hooks/use-toast'

export default function VolunteerLogin() {
  const router = useRouter()
  const { toast } = useToast()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api$/, '')

      const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          title: 'Login Failed',
          description: data.message || 'Invalid email or password',
          variant: 'destructive',
        })
        return
      }

      if (data.user?.role !== 'volunteer') {
        toast({
          title: 'Access Denied',
          description: 'This account is not registered as a volunteer.',
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

      router.push('/dashboard/volunteer')
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

            <Button
              type="submit"
              className="w-full bg-[#4F46C8] text-white"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login Volunteer'}
            </Button>

          </form>

          {/* REGISTER LINK */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup/volunteer-register"
              className="text-[#4F46C8] font-medium hover:underline"
            >
              Register as Volunteer
            </Link>
          </p>

        </CardContent>

      </Card>

    </div>
  )
}