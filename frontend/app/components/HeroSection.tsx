'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Building2,
  AlertTriangle,
  Trophy,
  ShieldCheck,
  Zap,
  MapPin,
  Award,
  Bell,
  X,
  Mail,
  Lock,
  Loader2,
  LogIn,
} from 'lucide-react'

const floatingStats = [
  { icon: Users,         num: '480+', label: 'Verified volunteers', color: 'text-[#4F46C8]', bg: 'bg-[#EEF0FF]', pos: '-top-4 -left-5' },
  { icon: Building2,     num: '420+', label: 'Active NGOs',         color: 'text-green-700', bg: 'bg-green-50',   pos: '-top-4 -right-3.5' },
  { icon: AlertTriangle, num: '350',  label: 'Live campaigns',      color: 'text-rose-800',  bg: 'bg-rose-50',    pos: '-bottom-4 -left-3.5' },
  { icon: Trophy,        num: '460+', label: 'Responses done',      color: 'text-amber-800', bg: 'bg-amber-50',   pos: '-bottom-4 -right-4.5' },
]

const features = [
  { icon: ShieldCheck, label: 'Background verified' },
  { icon: Zap,         label: 'Avg. 14 min response' },
  { icon: MapPin,      label: 'Location matching' },
  { icon: Award,       label: 'Skill-based dispatch' },
  { icon: Bell,        label: '24/7 alert system' },
]

const skills = [
  { label: 'First aid',        style: 'bg-[#EEF0FF] text-[#3730A3] border-[#4F46C8]/20' },
  { label: 'Search & rescue',  style: 'bg-amber-50  text-amber-900  border-amber-200' },
  { label: 'Psychosocial',     style: 'bg-green-50  text-green-800  border-green-200' },
  { label: 'Translator',       style: 'bg-rose-50   text-rose-800   border-rose-200' },
  { label: 'Logistics',        style: 'bg-sky-50    text-sky-800    border-sky-200' },
]

const stats = [
  { num: '47',   label: 'Deployments' },
  { num: '14m',  label: 'Avg. response' },
  { num: '4.9★', label: 'NGO rating' },
]

type LoginRole = 'volunteer' | 'ngo'

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // ── Quick access login modal state ──
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginRole, setLoginRole] = useState<LoginRole>('volunteer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    heroRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const openLogin = (role: LoginRole) => {
    setLoginRole(role)
    setLoginError('')
    setLoginOpen(true)
  }

  const closeLogin = () => {
    setLoginOpen(false)
    setEmail('')
    setPassword('')
    setLoginError('')
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter both email and password.')
      return
    }

    setSubmitting(true)

    // TODO: replace with a real auth call to your API.
    // For now this signs the person in locally so the rest of the app
    // (which reads these keys from localStorage) works end to end.
    setTimeout(() => {
      if (loginRole === 'volunteer') {
        const profileId = Date.now()
        localStorage.setItem('volunteer_profile_id', String(profileId))
        localStorage.setItem('volunteer_name', email.split('@')[0])
        router.push('/dashboard/volunteer')
      } else {
        const ngoId = Date.now()
        localStorage.setItem('ngo_id', String(ngoId))
        localStorage.setItem('ngo_email', email)
        router.push('/dashboard/ngo')
      }
      setSubmitting(false)
      closeLogin()
    }, 500)
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden"
    >
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-30 right-[8%]  w-130 h-130 rounded-full bg-[#4F46C8]/10 blur-[90px] animate-blob" />
        <div className="absolute bottom-0  right-[28%] w-90  h-90  rounded-full bg-[#7683D6]/15 blur-[80px] animate-blob" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[35%] left-[3%]  w-70  h-70  rounded-full bg-[#EEF0FF]/60 blur-[70px] animate-blob" style={{ animationDelay: '6s' }} />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #4F46C8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-16 items-center w-full relative z-10">

        {/* ── LEFT ── */}
        <div>
          {/* Live badge + quick access login */}
          <div className="reveal flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="inline-flex items-center gap-2 bg-[#4F46C8]/10 border border-[#4F46C8]/20 text-[#4F46C8] text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F46C8] animate-pulse" />
              Trusted Emergency Response Network
            </div>

            {/* <div className="inline-flex items-center gap-1.5 bg-white border border-black/[0.08] rounded-full p-1 shadow-sm">
              <button
                type="button"
                onClick={() => openLogin('volunteer')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4F46C8] px-3 py-1.5 rounded-full hover:bg-[#4F46C8]/10 transition"
              >
                <Users size={13} />
                Volunteer Login
              </button>
              <span className="w-px h-4 bg-black/[0.08]" />
              <button
                type="button"
                onClick={() => openLogin('ngo')}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4F46C8] px-3 py-1.5 rounded-full hover:bg-[#4F46C8]/10 transition"
              >
                <Building2 size={13} />
                NGO Login
              </button>
            </div> */}
          </div>

          {/* Headline */}
          <h1 className="reveal reveal-delay-1 font-display font-extrabold text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.1] text-gray-900 mb-5">
            Connecting{' '}
            <span className="bg-gradient-to-br from-[#4F46C8] to-[#7683D6] bg-clip-text text-transparent">
              Verified Volunteers
            </span>{' '}
            with Real Emergencies
          </h1>

          {/* Subtext */}
          <p className="reveal reveal-delay-2 text-lg text-gray-500 leading-relaxed mb-7 max-w-[440px]">
            A trusted volunteer coordination platform for NGOs, emergency response teams, and social impact campaigns — verified, fast, and reliable.
          </p>

          {/* Feature pills */}
          <div className="reveal reveal-delay-2 flex flex-wrap gap-2 mb-8">
            {features.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 bg-[#4F46C8]/[0.06] border border-[#4F46C8]/[0.18] text-[#4338CA] text-[12.5px] font-medium px-3.5 py-1.5 rounded-full"
              >
                <Icon size={13} />
                {label}
              </span>
            ))}
          </div>

          {/* Trust bar */}
          <div className="reveal reveal-delay-3 flex flex-wrap items-center gap-4 pt-6 border-t border-border/60">
            <div className="flex -space-x-2">
              {['#4F46C8','#7683D6','#B9C0D4','#6B7280','#4F46C8'].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: c }}
                >
                  {['S','R','A','P','M'][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">480+</span> volunteers already verified
            </p>
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-100 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              350 active campaigns
            </span>
          </div>
        </div>

        {/* ── RIGHT — Volunteer card ── */}
        <div className="reveal reveal-delay-2 relative hidden lg:block px-7 py-8">
          {/* Decorative spinning ring */}
          <div className="absolute inset-[-36px] rounded-full border border-[#4F46C8]/07 animate-spin-slow pointer-events-none" />

          <div className="relative z-10 bg-white border border-black/[0.09] rounded-3xl p-7 shadow-[0_4px_28px_rgba(0,0,0,0.07)]">

            {/* Volunteer profile */}
            <div className="flex items-center gap-4 pb-5 border-b border-black/[0.07] mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46C8] to-[#7683D6] flex items-center justify-center text-2xl flex-shrink-0">
                🧑‍⚕️
              </div>
              <div>
                <p className="font-bold text-[15px] text-gray-900 flex items-center gap-2">
                  Sara Patel
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                </p>
                <p className="text-[12px] text-gray-500">Emergency Medical · Kathmandu, Nepal · Level 3 Responder</p>
              </div>
            </div>

            {/* Skills */}
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Registered skills</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {skills.map(({ label, style }) => (
                <span key={label} className={`text-[12px] font-medium px-3 py-1 rounded-full border ${style}`}>
                  {label}
                </span>
              ))}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {stats.map(({ num, label }) => (
                <div key={label} className="bg-gray-50 rounded-xl py-3 text-center">
                  <p className="text-lg font-extrabold text-[#4F46C8] leading-none">{num}</p>
                  <p className="text-[10.5px] text-gray-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Active deployment alert */}
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={16} className="text-amber-700" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900">Flood relief — Terai Region</p>
                <p className="text-[11.5px] text-gray-500">Medical volunteers needed · 3 hrs left</p>
              </div>
              <button className="ml-auto px-3.5 py-1.5 bg-[#4F46C8] text-white text-[12px] font-semibold rounded-lg flex-shrink-0">
                Respond
              </button>
            </div>
          </div>

          {/* Floating stat cards */}
          {floatingStats.map(({ icon: Icon, num, label, color, bg, pos }, i) => {
            const delays = ['0s','1.5s','3s','4.5s']
            return (
              <div
                key={i}
                className={`absolute ${pos} bg-white border border-black/[0.09] rounded-2xl px-3 py-2 flex items-center gap-2.5 shadow-[0_3px_14px_rgba(0,0,0,0.07)] z-20 animate-float`}
                style={{ animationDelay: delays[i] }}
              >
                <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className={color} />
                </div>
                <div>
                  <p className={`font-extrabold text-[14px] leading-none ${color}`}>{num}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* ── Quick access login modal ── */}
      {loginOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/50 flex items-center justify-center p-4"
          onClick={closeLogin}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLogin}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            >
              <X size={16} />
            </button>

            {/* Role tabs */}
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
              <button
                type="button"
                onClick={() => setLoginRole('volunteer')}
                className={`inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-1.5 rounded-lg transition ${
                  loginRole === 'volunteer'
                    ? 'bg-white text-[#4F46C8] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users size={14} />
                Volunteer
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('ngo')}
                className={`inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-1.5 rounded-lg transition ${
                  loginRole === 'ngo'
                    ? 'bg-white text-[#4F46C8] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building2 size={14} />
                NGO
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {loginRole === 'volunteer' ? 'Volunteer Login' : 'NGO Login'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {loginRole === 'volunteer'
                ? 'Sign in to view and apply for tasks near you.'
                : 'Sign in to manage your tasks and applications.'}
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#7683D6] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#7683D6] focus:border-transparent transition"
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-sm text-rose-600">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#4F46C8] hover:bg-[#4338CA] text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Login as {loginRole === 'volunteer' ? 'Volunteer' : 'NGO'}
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  closeLogin()
                  router.push(loginRole === 'volunteer' ? '/register/volunteer' : '/register/ngo')
                }}
                className="text-[#4F46C8] font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      )}
    </section>
  )
}