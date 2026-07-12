'use client'
import { useEffect, useRef } from 'react'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    stars: 5,
    text: 'VolunteerConnect made it possible for us to deploy 200 trained volunteers within 4 hours of the flood announcement. The verification system gave us complete confidence in every person we sent to the field.',
    name: 'Ramesh Adhikari',
    role: 'Field Coordinator, Disaster Response NGO',
    initials: 'RA',
  },
  {
    stars: 5,
    text: 'As a volunteer, I love how easy it is to find opportunities that match my medical skills. The badge system makes me feel truly recognized for my contributions.',
    name: 'Sita Karmacharya',
    role: 'Medical Volunteer, Kathmandu',
    initials: 'SK',
  },
  {
    stars: 5,
    text: "The NGO dashboard gives us exactly what we need: real-time tracking, volunteer availability, and incident reports in one clean interface. Our response efficiency has improved dramatically.",
    name: 'Anita Shrestha',
    role: 'Programs Director, Humanitarian Partner Org',
    initials: 'AS',
  },
]

export default function Testimonials() {
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
    <section ref={ref} className="py-24" style={{ background: '#F0F1F3' }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-14">
          <div
            className="reveal inline-flex items-center gap-2 text-[11.5px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4"
            style={{ background: 'rgba(79,70,200,0.1)', color: '#4F46C8' }}
          >
            <Quote size={13} strokeWidth={2.5} />
            Testimonials
          </div>
          <h2
            className="reveal reveal-delay-1 font-display font-extrabold text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight mb-4"
            style={{ color: '#111827' }}
          >
            Voices from Our{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(90deg, #4F46C8, #7683D6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Community
            </span>
          </h2>
          <p className="reveal reveal-delay-2 text-lg max-w-lg mx-auto" style={{ color: '#6B7280' }}>
            Real feedback from volunteers and NGO coordinators making change through our platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1} group relative bg-white rounded-3xl p-7 transition-all duration-300 hover:-translate-y-2 overflow-hidden`}
              style={{
                border: '1px solid #CACDD3',
                boxShadow: '0 1px 3px rgba(17,24,39,0.06)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 16px 32px rgba(79,70,200,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(17,24,39,0.06)')}
            >
              {/* Top accent bar on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                style={{ background: 'linear-gradient(90deg, #4F46C8, #7683D6)' }}
              />

              {/* Large decorative quote mark */}
              <Quote
                size={72}
                className="absolute -top-2 -right-2 opacity-[0.06] pointer-events-none"
                style={{ color: '#4F46C8' }}
                fill="currentColor"
              />

              {/* Quote icon badge */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 relative"
                style={{ background: 'rgba(79,70,200,0.1)' }}
              >
                <Quote size={18} style={{ color: '#4F46C8' }} />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-lg" style={{ color: '#7683D6' }}>★</span>
                ))}
              </div>

              <p className="text-[14.5px] leading-relaxed mb-6 relative" style={{ color: '#374151' }}>
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #CACDD3' }}>
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #4F46C8, #7683D6)' }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="font-display font-bold text-[14.5px]" style={{ color: '#111827' }}>
                    {t.name}
                  </p>
                  <p className="text-[12.5px]" style={{ color: '#6B7280' }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}