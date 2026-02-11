'use client';

import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import { Button } from '@/components/ui/Button';
import { FiShield, FiUsers, FiCreditCard, FiActivity, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-[#f8fafc] overflow-hidden">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-indigo-500/20 blur-[120px]" />
          <div className="absolute bottom-0 right-[-100px] w-[380px] h-[380px] bg-cyan-500/20 blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Modern Living,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Simplified.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Society360 helps you manage residents, security, payments, and operations
            with clarity and confidence — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="px-8 h-14 rounded-full shadow-lg shadow-indigo-500/30">
                Get Started <FiArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="ghost"
                className="px-8 h-14 rounded-full border border-white/15 text-slate-200 hover:bg-white/5"
              >
                Live Demo
              </Button>
            </Link>
          </div>

          {/* Preview */}
          <div className="mt-20 max-w-5xl mx-auto rounded-2xl bg-[#0b1220]/80 border border-white/10 backdrop-blur-xl p-4 shadow-xl">
            <div className="aspect-[16/9] rounded-xl bg-[#0f172a] border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-300">
                  Interactive Dashboard Preview
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage your society
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Purpose-built features designed for modern residential communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<FiUsers className="w-7 h-7 text-indigo-400" />}
              title="Community Connect"
              description="Transparent communication between residents, staff, and administrators."
            />
            <FeatureCard
              icon={<FiShield className="w-7 h-7 text-emerald-400" />}
              title="Visitor Management"
              description="Secure gate access with digital passes and real-time tracking."
            />
            <FeatureCard
              icon={<FiCreditCard className="w-7 h-7 text-purple-400" />}
              title="Smart Payments"
              description="Automated billing, receipts, and expense tracking."
            />
            <FeatureCard
              icon={<FiActivity className="w-7 h-7 text-orange-400" />}
              title="Quick Resolution"
              description="Efficient helpdesk for maintenance and complaints."
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-90 -z-10" />
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your society?
          </h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Join communities that already trust Society360 to simplify daily operations.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="px-10 h-14 rounded-full bg-white text-indigo-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
          <p>© 2024 Society360. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="#" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================= FEATURE CARD ================= */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-[#0b1220] border border-white/10 hover:border-white/20 transition shadow-sm">
      <div className="mb-4 p-3 rounded-lg bg-[#020617] inline-flex">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
