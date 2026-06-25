'use client'
import { useEffect, useRef } from 'react'
import { UserPlus, BadgeCheck, Rocket, ArrowRight } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Register Account',
    desc: 'Create your free profile as a volunteer, NGO, or emergency response team. Quick and secure onboarding in under 5 minutes.',
    detail: 'Fill name, skills, location, and choose your role.',
  },
  {
    num: '02',
    icon: BadgeCheck,
    title: 'Get Verified',
    desc: 'Submit your documents for identity or organizational verification. Our team reviews and approves within 24–48 hours.',
    detail: 'Upload ID, credentials, or NGO registration docs.',
  },
  {
    num: '03',
    icon: Rocket,
    title: 'Join & Respond',
    desc: 'Browse live opportunities, apply for campaigns matching your skills, and coordinate with NGOs in real time.',
    detail: 'Get matched, check in via QR, earn reputation badges.',
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries =>
        entries.forEach(e =>
          e.isIntersecting && e.target.classList.add('visible')
        ),
      { threshold: 0.1 }
    )

    ref.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-24 bg-bg relative overflow-hidden">
      
      {/* Decorative shape */}
      <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#4F46C8]/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 bg-[#4F46C8]/10 text-[#4F46C8] text-[11.5px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            ⚙️ How It Works
          </div>

          <h2 className="reveal reveal-delay-1 font-display font-extrabold text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight text-gray-900 mb-4">
            Three Steps to <span className="text-[#4F46C8]">Real Impact</span>
          </h2>

          <p className="reveal reveal-delay-2 text-lg text-gray-500 max-w-lg mx-auto">
            From sign-up to deployment in minutes. Our streamlined process gets you where you're needed fast.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-6 relative">

          {/* Connector line */}
          <div className="hidden lg:block absolute top-[70px] left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-0.5 bg-gradient-to-r from-[#4F46C8]/30 via-[#7683D6]/50 to-[#4F46C8]/30" />

          {steps.map((s, i) => {
            const Icon = s.icon

            return (
              <div
                key={i}
                className={`reveal reveal-delay-${i + 1} group relative bg-white rounded-3xl p-8 border border-[#CACDD3] shadow-card hover:shadow-card-hover transition-all duration-300`}
              >

                {/* Icon + Number */}
                <div className="relative z-10 flex items-center gap-4 mb-6">

                  <div className="w-14 h-14 rounded-2xl bg-[#4F46C8] flex items-center justify-center shadow-glow group-hover:shadow-glow-lg group-hover:scale-105 transition-all">
                    <Icon size={22} className="text-white" />
                  </div>

                  {/* ✅ FIXED NUMBER COLOR HERE */}
                  <span className="font-display font-extrabold text-4xl text-[#4F46C8]/20 group-hover:text-[#4F46C8]/40 transition-colors select-none">
                    {s.num}
                  </span>

                </div>

                <h4 className="font-display font-bold text-xl text-[#111827] mb-3">
                  {s.title}
                </h4>

                <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                  {s.desc}
                </p>

                {/* Detail chip */}
                <div className="inline-flex items-center gap-1.5 bg-[#4F46C8]/10 text-[#4F46C8] text-xs font-semibold px-3 py-1.5 rounded-full">
                  <div className="w-1 h-1 rounded-full bg-[#4F46C8]" />
                  {s.detail}
                </div>

                {/* Arrow */}
                {i < steps.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="hidden lg:block absolute -right-3.5 top-[70px] text-[#7683D6] bg-white border border-[#CACDD3] rounded-full p-1 w-7 h-7 shadow-sm z-20"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}