'use client'
import { useEffect, useRef } from 'react'
import { Building, ShieldCheck, BarChart3, HandHeart } from 'lucide-react'

const cards = [
  {
    icon: Building,
    title: 'NGO Verification',
    desc: 'All NGOs undergo legal registration checks, document validation, and compliance reviews before onboarding to our platform.',
    accent: 'from-brand/10 to-accent/15',
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
  },
  {
    icon: ShieldCheck,
    title: 'Volunteer Identity Verification',
    desc: 'Government ID checks, background screening, and skill certification validation for every single volunteer who registers.',
    accent: 'from-green-50 to-emerald-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: BarChart3,
    title: 'Secure Participation Tracking',
    desc: 'Tamper-proof digital records of all volunteer hours, attendance, and contributions with QR-based verification.',
    accent: 'from-blue-50 to-indigo-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: HandHeart,
    title: 'Trusted Emergency Coordination',
    desc: 'Coordinated response protocols with government bodies and international humanitarian organizations worldwide.',
    accent: 'from-amber-50 to-orange-50',
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => {
            const Icon = c.icon
            return (
              <div
                key={i}
                className={`reveal reveal-delay-${i + 1} group relative bg-white rounded-3xl p-7 border border-border shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-default`}
              >
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.accent.replace('from-','').replace('to-','')} opacity-0 group-hover:opacity-100 transition-opacity`}
                  style={{ background: 'linear-gradient(90deg, #4F46C8, #7683D6)' }}
                />
                <div className={`w-13 h-13 w-12 h-12 rounded-2xl ${c.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={c.iconColor} />
                </div>
                <h4 className="font-display font-bold text-[15.5px] text-gray-900 mb-3 leading-snug">{c.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>

                {/* Hover glow bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl" />
              </div>
            )
          })}
        </div>

        {/* Bottom bar: partner logos marquee */}
        <div className="reveal mt-16 overflow-hidden py-5 border-y border-border/60">
          <p className="text-center text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">Trusted By</p>
          <div className="flex animate-marquee gap-14 w-max">
            {['Nepal Red Cross', 'UNICEF Nepal', 'UNDP Nepal', 'MSF', 'TPO Nepal', 'Save the Children', 'WHO Nepal', 'OCHA',
              'Nepal Red Cross', 'UNICEF Nepal', 'UNDP Nepal', 'MSF', 'TPO Nepal', 'Save the Children', 'WHO Nepal', 'OCHA'
            ].map((name, i) => (
              <span key={i} className="text-sm font-semibold text-gray-400 whitespace-nowrap hover:text-brand transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}