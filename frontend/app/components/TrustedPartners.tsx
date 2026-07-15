'use client'
import { useEffect, useRef } from 'react'
import { Building, ShieldCheck, BarChart3, HandHeart } from 'lucide-react'

const cards = [
  {
    icon: Building,
    title: 'NGO Verification',
    desc: 'All NGOs undergo legal registration checks, document validation, and compliance reviews before onboarding to our platform.',
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
  },
  {
    icon: ShieldCheck,
    title: 'Volunteer Identity Verification',
    desc: 'Government ID checks, background screening, and skill certification validation for every single volunteer who registers.',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: BarChart3,
    title: 'Secure Participation Tracking',
    desc: 'Tamper-proof digital records of all volunteer hours, attendance, and contributions with QR-based verification.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: HandHeart,
    title: 'Trusted Emergency Coordination',
    desc: 'Coordinated response protocols with government bodies and international humanitarian organizations worldwide.',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
]

export default function TrustSection() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-[#e8eaf2] to-[#F0F1F3]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 bg-brand/10 text-brand text-[11.5px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            🛡️ Trust & Verification
          </div>
          <h2 className="reveal reveal-delay-1 font-display font-extrabold text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight text-gray-900 mb-4">
            Built on a Foundation of <span className="text-gradient">Trust</span>
          </h2>
          <p className="reveal reveal-delay-2 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Every participant goes through a rigorous verification process to ensure safety, accountability, and reliability.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon
            return (
              <div
                key={i}
                className={`reveal reveal-delay-${i + 1} group relative bg-white rounded-3xl p-7 border border-border shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-default`}
              >
                {/* Top gradient accent, now animates in cleanly on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                  style={{ background: 'linear-gradient(90deg, #4F46C8, #7683D6)' }}
                />

                <div className={`w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} className={c.iconColor} />
                </div>

                <h4 className="font-display font-bold text-[15.5px] text-gray-900 mb-3 leading-snug">
                  {c.title}
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>

                {/* Subtle hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}