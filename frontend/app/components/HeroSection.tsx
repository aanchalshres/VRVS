'use client'
import { useEffect, useRef } from 'react'
import { ArrowRight, Building2, Users, AlertTriangle, Trophy } from 'lucide-react'

const floatingStats = [
  { icon: Users, num: '24,810+', label: 'Verified Volunteers', color: 'text-brand', bg: 'bg-brand/10', pos: 'top-6 left-4' },
  { icon: Building2, num: '1,340+', label: 'Active NGOs', color: 'text-green-600', bg: 'bg-green-50', pos: 'top-6 right-4' },
  { icon: AlertTriangle, num: '892', label: 'Emergency Campaigns', color: 'text-red-500', bg: 'bg-red-50', pos: 'bottom-6 left-4' },
  { icon: Trophy, num: '18,220+', label: 'Successful Responses', color: 'text-amber-500', bg: 'bg-amber-50', pos: 'bottom-6 right-4' },
]

const networkNodes = [
  { cx: 80, cy: 50, emoji: '🧑' }, { cx: 240, cy: 50, emoji: '👩' },
  { cx: 40, cy: 130, emoji: '🏥' }, { cx: 280, cy: 130, emoji: '🤝' },
  { cx: 80, cy: 210, emoji: '🌍' }, { cx: 240, cy: 210, emoji: '🚒' },
]

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    heroRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] right-[8%] w-[520px] h-[520px] rounded-full bg-brand/15 blur-[90px] animate-blob" />
        <div className="absolute bottom-0 right-[28%] w-[360px] h-[360px] rounded-full bg-accent/20 blur-[80px] animate-blob" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[35%] left-[3%] w-[280px] h-[280px] rounded-full bg-soft/60 blur-[70px] animate-blob" style={{ animationDelay: '6s' }} />
      </div>

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle, #4F46C8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-16 items-center w-full relative z-10">
        {/* LEFT */}
        <div>
          <div className="reveal inline-flex items-center gap-2 bg-brand/10 border border-brand/20 text-brand text-[12.5px] font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" />
            Trusted Emergency Response Network
          </div>

          <h1 className="reveal reveal-delay-1 font-display font-extrabold text-[clamp(2.4rem,5vw,3.8rem)] leading-[1.1] text-gray-900 mb-5">
            Connecting{' '}
            <span className="text-gradient">Verified Volunteers</span>
            {' '}with Real Emergencies
          </h1>

          <p className="reveal reveal-delay-2 text-lg text-gray-500 leading-relaxed mb-8 max-w-[480px]">
            A trusted volunteer coordination platform for NGOs, emergency response teams, and social impact campaigns — verified, fast, and reliable.
          </p>

          <div className="reveal reveal-delay-3 flex flex-wrap gap-3">
            <button className="group inline-flex items-center gap-2 px-7 py-3.5 text-[15.5px] font-semibold text-white bg-[#4F46C8] rounded-2xl shadow-glow hover:shadow-glow-lg hover:-translate-y-1 transition-all">
  🙋 Become a Volunteer
  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
</button>
            <button className="inline-flex items-center gap-2 px-7 py-3.5 text-[15.5px] font-semibold text-brand bg-white border border-border rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              🏢 Register NGO
            </button>
          </div>

          {/* Trust bar */}
          <div className="reveal reveal-delay-4 flex items-center gap-5 mt-10 pt-8 border-t border-border/60">
            <div className="flex -space-x-2">
              {['#4F46C8','#7683D6','#B9C0D4','#6B7280','#4F46C8'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-bold" style={{ background: c }}>
                  {['S','R','A','P','M'][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">24,810+</span> volunteers already verified
            </p>
          </div>
        </div>

        {/* RIGHT — Network illustration with floating cards */}
        <div className="reveal reveal-delay-2 relative hidden lg:block">
          <div className="relative bg-white/50 backdrop-blur-sm border border-border/60 rounded-[32px] p-8 shadow-card-hover min-h-[480px] flex items-center justify-center overflow-hidden">
            {/* Decorative ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] rounded-full border border-brand/10 animate-spin-slow" />
              <div className="absolute w-[220px] h-[220px] rounded-full border border-brand/08" />
            </div>

            <svg viewBox="0 0 320 270" xmlns="http://www.w3.org/2000/svg" fill="none" className="w-full max-w-[300px] relative z-10">
              {/* Lines */}
              {networkNodes.map((n, i) => (
                <line key={i} x1="160" y1="130" x2={n.cx} y2={n.cy}
                  stroke="rgba(79,70,200,0.2)" strokeWidth="1.5" strokeDasharray="5 3" />
              ))}
              {/* Center hub */}
              <circle cx="160" cy="130" r="42" fill="url(#grad1)" opacity="0.95" />
              <text x="160" y="125" textAnchor="middle" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="11" fill="white">VOLUNTEER</text>
              <text x="160" y="141" textAnchor="middle" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="11" fill="white">CONNECT</text>
              {/* Nodes */}
              {networkNodes.map((n, i) => (
                <g key={i}>
                  <circle cx={n.cx} cy={n.cy} r="24" fill="url(#grad2)" />
                  <text x={n.cx} y={n.cy + 6} textAnchor="middle" fontSize="18">{n.emoji}</text>
                </g>
              ))}
              {/* Verified ticks */}
              <circle cx="93" cy="37" r="9" fill="#22c55e" />
              <text x="93" y="41" textAnchor="middle" fontSize="9" fill="white">✓</text>
              <circle cx="253" cy="37" r="9" fill="#22c55e" />
              <text x="253" y="41" textAnchor="middle" fontSize="9" fill="white">✓</text>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46C8" />
                  <stop offset="100%" stopColor="#7683D6" />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(79,70,200,0.12)" />
                  <stop offset="100%" stopColor="rgba(118,131,214,0.18)" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating stat cards */}
            {floatingStats.map((s, i) => {
              const Icon = s.icon
              const delays = ['0s', '1.5s', '3s', '4.5s']
              return (
                <div
                  key={i}
                  className={`absolute ${s.pos} bg-white rounded-2xl px-3.5 py-2.5 shadow-card border border-border/60 flex items-center gap-2.5 animate-float`}
                  style={{ animationDelay: delays[i] }}
                >
                  <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <Icon size={15} className={s.color} />
                  </div>
                  <div>
                    <p className={`font-display font-bold text-base leading-none ${s.color}`}>{s.num}</p>
                    <p className="text-[10.5px] text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
