'use client'
import { useEffect, useRef } from 'react'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    stars: 5,
    text: 'VolunteerConnect made it possible for us to deploy 200 trained volunteers within 4 hours of the flood announcement. The verification system gave us complete confidence in every person we sent to the field.',
    name: 'Ramesh Adhikari',
    role: 'Field Coordinator, Nepal Red Cross',
    initials: 'RA',
    color: 'from-brand to-accent',
  },
  {
    stars: 5,
    text: 'As a volunteer, I love how easy it is to find opportunities that match my medical skills. The QR attendance and badge system makes me feel truly recognized for my contributions.',
    name: 'Sita Karmacharya',
    role: 'Medical Volunteer, Kathmandu',
    initials: 'SK',
    color: 'from-green-500 to-emerald-400',
  },
  {
    stars: 5,
    text: "The NGO dashboard gives us exactly what we need: real-time tracking, volunteer availability, and incident reports in one clean interface. Our response efficiency has improved dramatically.",
    name: 'Anita Shrestha',
    role: 'Programs Director, UNICEF Nepal',
    initials: 'AS',
    color: 'from-amber-500 to-orange-400',
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
    <section ref={ref} className="py-24 bg-gradient-to-br from-[#e8eaf2] to-[#F0F1F3]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 bg-brand/10 text-brand text-[11.5px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            💬 Testimonials
          </div>
          <h2 className="reveal reveal-delay-1 font-display font-extrabold text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight text-gray-900 mb-4">
            Voices from Our <span className="text-gradient">Community</span>
          </h2>
          <p className="reveal reveal-delay-2 text-lg text-gray-500 max-w-lg mx-auto">
            Real feedback from volunteers and NGO coordinators making change through our platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1} group bg-white rounded-3xl p-7 border border-border shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300`}
            >
              {/* Quote icon */}
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mb-5">
                <Quote size={18} className="text-brand" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-amber-400 text-lg">★</span>
                ))}
              </div>

              <p className="text-[14.5px] text-gray-500 leading-relaxed mb-6 italic">"{t.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-display font-bold text-[14.5px] text-gray-900">{t.name}</p>
                  <p className="text-[12.5px] text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}