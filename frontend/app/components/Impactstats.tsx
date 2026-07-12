'use client'
import { useEffect, useRef, useState } from 'react'
import {
  BadgeCheck,
  Building2,
  Siren,
  Trophy,
} from 'lucide-react'

const stats = [
  {
    target: 299,
    suffix: '+',
    label: 'Volunteers Verified',
    icon: BadgeCheck,
  },
  {
    target: 300,
    suffix: '+',
    label: 'NGOs Registered',
    icon: Building2,
  },
  {
    target: 500,
    suffix: '+',
    label: 'Emergency Responses',
    icon: Siren,
  },
  {
    target: 460,
    suffix: '+',
    label: 'Campaigns Completed',
    icon: Trophy,
  },
]

function useCounter(target: number, active: boolean, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return

    let start = 0
    const increment = target / (duration / 16)

    const timer = setInterval(() => {
      start += increment

      if (start >= target) {
        setCount(target)
        clearInterval(timer)
        return
      }

      setCount(Math.floor(start))
    }, 16)

    return () => clearInterval(timer)
  }, [active, target, duration])

  return count
}

function StatCard({ target, suffix, label, icon: Icon, active }: any) {
  const count = useCounter(target, active)

  return (
    <div className="group bg-white/12 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 hover:-translate-y-2 transition-all duration-300">
      <div className="flex justify-center mb-4">
        <Icon className="w-11 h-11 text-white" strokeWidth={2.2} />
      </div>

      <div className="font-display font-extrabold text-5xl text-white mb-2 leading-none">
        {count.toLocaleString()}
        {suffix}
      </div>

      <div className="text-white/70 font-medium">{label}</div>
    </div>
  )
}

export default function ImpactStats() {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setActive(true)
            e.target
              .querySelectorAll('.reveal')
              .forEach(el => el.classList.add('visible'))
          }
        })
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="py-24 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #4F46C8 0%, #7683D6 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-60px] w-80 h-80 rounded-full bg-white/8 blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-40px] w-64 h-64 rounded-full bg-white/8 blur-[50px] pointer-events-none" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white text-[11.5px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
            📊 Our Impact
          </div>

          <h2 className="reveal reveal-delay-1 font-display font-extrabold text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight text-white mb-4">
            Real Numbers. Real Impact.
          </h2>

          <p className="reveal reveal-delay-2 text-lg text-white/72 max-w-lg mx-auto">
            Every statistic represents a life touched, a community supported,
            and a crisis managed with dignity.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <div
              key={i}
              className="reveal"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <StatCard {...s} active={active} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}