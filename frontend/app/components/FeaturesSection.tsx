'use client'
import { useEffect, useRef } from 'react'
import { Siren, Target, Bell, LineChart, QrCode, Award, FileWarning, FileCheck } from 'lucide-react'

const features = [
  { icon: Siren, title: 'Emergency Response Management', desc: 'Rapidly deploy verified volunteers to active emergencies with automated alerts and smart task assignments.', color: 'text-red-500', bg: 'bg-red-50' },
  { icon: Target, title: 'Volunteer Matching', desc: 'AI-powered matching connects the right skills and availability to the right opportunities instantly.', color: 'text-brand', bg: 'bg-brand/10' },
  { icon: Bell, title: 'Real-time Notifications', desc: 'Instant push, SMS, and email alerts for emergencies, status updates, and new campaign opportunities.', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: LineChart, title: 'Participation Tracking', desc: 'Comprehensive dashboards tracking volunteer hours, tasks completed, and impact metrics for every NGO.', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: QrCode, title: 'QR Attendance', desc: 'Contactless check-in and attendance tracking with secure QR codes at every volunteering event.', color: 'text-purple-600', bg: 'bg-purple-50' },
  { icon: Award, title: 'Badge & Reputation System', desc: 'Digital credentials, achievement badges, and reputation scores for dedicated and impactful volunteers.', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: FileWarning, title: 'Incident Reporting', desc: 'Real-time incident logging and escalation tools for field coordinators and on-ground teams worldwide.', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: FileCheck, title: 'Document Verification', desc: 'Secure encrypted document storage and verification pipeline with full audit trails for compliance needs.', color: 'text-teal-600', bg: 'bg-teal-50' },
]

export default function FeatureGrid() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.08 }
    )
    ref.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} id="features" className="py-24 bg-gradient-to-br from-[#e8eaf2] to-[#F0F1F3]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 bg-brand/10 text-brand text-[11.5px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            ✨ Platform Features
          </div>
          <h2 className="reveal reveal-delay-1 font-display font-extrabold text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight text-gray-900 mb-4">
            Everything for <span className="text-gradient">Volunteer Coordination</span>
          </h2>
          <p className="reveal reveal-delay-2 text-lg text-gray-500 max-w-lg mx-auto">
            Powerful tools purpose-built for the real demands of humanitarian and emergency response work.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon
            const delay = (i % 4) + 1
            return (
              <div
                key={i}
                className={`reveal reveal-delay-${delay} group bg-white rounded-3xl p-6 border border-border shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 cursor-default`}
              >
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <Icon size={20} className={f.color} />
                </div>
                <h4 className="font-display font-bold text-[14.5px] text-gray-900 mb-2 leading-snug">{f.title}</h4>
                <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}