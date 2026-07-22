import type { Metadata } from 'next';
import Navbar from '../../components/Navbar'; // adjust path to match your project
import {
  FaCheck,
  FaUsers,
  FaBuilding,
  FaUserShield,
  FaTasks,
  FaHandsHelping,
  FaCloudUploadAlt,
  FaShieldAlt,
  FaArrowRight,
} from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'About Us | Sahayogi',
  description:
    'Connecting verified NGOs with passionate volunteers through Sahayogi.',
};

// Color reference (used inline via arbitrary Tailwind values):
// Primary CTA:     #4F46C8
// Secondary CTA:   #7683D6
// Background:      #F0F1F3
// Borders:         #CACDD3
// Soft sections:   #B9C0D4
// Text Primary:    #111827
// Text Secondary:  #6B7280

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F0F1F3] text-[#111827]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#4F46C8] px-4 py-20 text-center text-white">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-[#7683D6]/40 blur-3xl" />
          </div>

          <div className="relative">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90">
              About Sahayogi
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              Sahayogi
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/85">
              Connecting Verified NGOs with Passionate Volunteers
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="px-4 py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <span className="mb-3 inline-block h-1 w-14 rounded-full bg-[#4F46C8]" />
            <p className="text-lg leading-relaxed text-[#6B7280]">
              We bridge the gap between NGOs and volunteers through a transparent,
              verified ecosystem — so every opportunity is trustworthy and every
              contribution counts.
            </p>
          </div>
        </section>

        {/* Role Cards */}
        <section className="bg-[#B9C0D4]/25 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-[#111827]">Built for Everyone Involved</h2>
              <p className="mt-2 text-[#6B7280]">One platform, three roles, working in sync.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {roleCards.map((card) => (
                <div
                  key={card.title}
                  className="group rounded-2xl border border-[#CACDD3] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#4F46C8]/10"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4F46C8]/10 text-xl text-[#4F46C8] transition-transform duration-200 group-hover:scale-110">
                    {card.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-[#111827]">
                    {card.title}
                  </h3>
                  <ul className="space-y-2.5 text-sm text-[#6B7280]">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#7683D6]/15">
                          <FaCheck className="text-[#4F46C8]" size={9} />
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-[#111827]">Key Features</h2>
              <p className="mt-2 text-[#6B7280]">Everything needed to make coordination effortless.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-4 rounded-xl border border-[#CACDD3] bg-white p-5 transition-shadow duration-200 hover:shadow-md"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4F46C8]/10 text-lg text-[#4F46C8]">
                    {f.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#111827]">{f.title}</h3>
                    <p className="mt-1 text-sm text-[#6B7280]">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-[#B9C0D4]/25 px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-[#111827]">How It Works</h2>
              <p className="mt-2 text-[#6B7280]">From sign-up to real impact, in four simple steps.</p>
            </div>
            <div className="relative grid gap-10 text-center sm:grid-cols-4 sm:gap-6">
              {/* Connecting line (desktop only) */}
              <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-0.5 bg-[#CACDD3] sm:block" />

              {steps.map((s, i) => (
                <div key={i} className="relative">
                  <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#4F46C8] text-lg font-bold text-white shadow-md shadow-[#4F46C8]/20">
                    {i + 1}
                  </div>
                  <h3 className="mb-1 font-semibold text-[#111827]">{s.title}</h3>
                  <p className="text-sm text-[#6B7280]">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-20">
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#CACDD3] bg-white p-10 text-center shadow-sm">
            <h2 className="mb-3 text-3xl font-bold text-[#111827]">
              Join the Movement
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-[#6B7280]">
              Whether you're an NGO or an individual — we'll help you connect.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/login/ngo-login"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#4F46C8] px-6 py-3 font-semibold text-white transition hover:bg-[#4338CA]"
              >
                For NGOs
                <FaArrowRight className="text-sm transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="/login/volunteer-login"
                className="group inline-flex items-center gap-2 rounded-lg border border-[#4F46C8] px-6 py-3 font-semibold text-[#4F46C8] transition hover:bg-[#4F46C8]/5"
              >
                For Volunteers
                <FaArrowRight className="text-sm transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

// ==============================
// Data
// ==============================

const roleCards = [
  {
    title: 'For NGOs',
    icon: <FaBuilding />,
    points: [
      'Create and manage opportunities',
      'Verify volunteer identities',
      'Review applications',
    ],
  },
  {
    title: 'For Volunteers',
    icon: <FaUsers />,
    points: [
      'Build a verified profile',
      'Apply to events & tasks',
      'Track your participation',
    ],
  },
  {
    title: 'For Admins',
    icon: <FaUserShield />,
    points: [
      'Verify NGOs & volunteers',
      'Monitor platform activity',
      'Ensure platform integrity',
    ],
  },
];

const features = [
  {
    icon: <FaShieldAlt />,
    title: 'Verification Workflow',
    description: 'NGOs verified by Admins; Volunteers verified by NGOs',
  },
  {
    icon: <FaTasks />,
    title: 'Opportunity Management',
    description: 'Post events, campaigns, and emergency responses',
  },
  {
    icon: <FaHandsHelping />,
    title: 'Skill-Based Matching',
    description: 'Volunteers showcase skills; NGOs find the right fit',
  },
  {
    icon: <FaCloudUploadAlt />,
    title: 'Document Upload',
    description: 'Securely upload IDs and certificates',
  },
];

const steps = [
  { title: 'Sign Up', description: 'Join as Admin, NGO, or Volunteer' },
  { title: 'Verify', description: 'Complete the verification process' },
  { title: 'Connect', description: 'Post or apply to opportunities' },
  { title: 'Participate', description: 'Contribute hours & give feedback' },
];