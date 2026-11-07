import React from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRightLeft,
  Clock,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Smartphone,
  CreditCard,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface HomeProps {
  onNavigate: (view: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { quickLoginDemo } = useAuth();

  const features = [
    {
      icon: ShieldCheck,
      title: 'Military-Grade Security',
      desc: 'Cryptographic scrypt hashing, signed session tokens, and strict server-authoritative balance protection.',
    },
    {
      icon: Zap,
      title: 'Instant Cash Operations',
      desc: 'Simulated currency dispenser, real-time balance updates, and automated digital ATM receipt slips.',
    },
    {
      icon: ArrowRightLeft,
      title: 'Verified Money Transfers',
      desc: 'Live recipient name pre-validation, atomic sender debit & receiver credit with rollback integrity.',
    },
    {
      icon: Clock,
      title: '24/7 ATM Availability',
      desc: 'Unrestricted digital teller simulation, balance inquiries, deposit slots, and daily withdrawal limits.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Transaction Audit Trail',
      desc: 'Comprehensive searchable ledger, multi-filter history, CSV exports, and printable thermal slips.',
    },
    {
      icon: Smartphone,
      title: 'Multi-Device Responsive',
      desc: 'Engineered for smooth usability on desktop monitors, tablets, iPads, and mobile smartphones.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Register or Launch Demo',
      desc: 'Create a new savings account with unique account numbers or click 1-Click Demo.',
    },
    {
      num: '02',
      title: 'Simulate ATM Operations',
      desc: 'Withdraw ₹500–₹10,000, deposit cash into the automated slot, or transfer funds to other accounts.',
    },
    {
      num: '03',
      title: 'Obtain Digital ATM Receipts',
      desc: 'Print or download your verified digital transaction slip with updated balance & barcode.',
    },
    {
      num: '04',
      title: 'Inspect Financial History',
      desc: 'Review transactions, monitor notifications, or switch to the Admin Portal to oversee banking operations.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#102A43] via-[#0D2135] to-[#102A43] text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Next-Generation Digital Banking Simulator</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Your Banking Experience, <span className="text-blue-400">Simplified.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Experience secure, fast, and convenient banking with our full-stack digital ATM
                simulation platform. Deposit cash, withdraw funds with daily limits, make verified
                transfers, and generate authenticated thermal receipts.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-sm backdrop-blur-xs transition-all hover:scale-[1.02]"
                >
                  <span>Access Account Login</span>
                </button>
              </div>

              {/* Quick Demo Launch Strip */}
              <div className="pt-4 border-t border-slate-700/60 max-w-xl">
                <p className="text-xs text-slate-400 mb-2 font-mono uppercase tracking-wider">
                  ⚡ 1-Click Instant Demo Credentials:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => quickLoginDemo('customer')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium hover:bg-emerald-900/60 transition-colors"
                  >
                    <span>Login as Customer (John Doe)</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => quickLoginDemo('admin')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs font-medium hover:bg-blue-900/60 transition-colors"
                  >
                    <span>Login as Admin (Alexander Vance)</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
                <img
                  src="/src/assets/images/bank_atm_hero_banner_1793602854777.jpg"
                  alt="Modern Apex Digital Bank ATM Terminal"
                  referrerPolicy="no-referrer"
                  className="w-full h-[380px] object-cover object-center"
                />
                {/* Floating mini overlay card */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#102A43]/90 backdrop-blur-md border border-white/15 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Active ATM Terminal #0492</p>
                      <p className="text-[11px] text-blue-300 font-mono">256-Bit Ledger Encrypted</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Network Status</span>
                    <span className="text-xs font-bold text-emerald-400">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Core Banking Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] tracking-tight">
            Engineered for Real-World Banking Operations
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Every transaction adheres strictly to server-side ACID consistency, preventing
            concurrency anomalies, negative balances, and unauthorized tampering.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#102A43]">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Simple Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-[#102A43] tracking-tight">
              How the Digital ATM Simulation Works
            </h2>
            <p className="text-slate-600 text-sm">
              Experience end-to-end digital banking right in your browser.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((st, i) => (
              <div key={i} className="relative space-y-3">
                <span className="font-mono text-3xl font-black text-blue-600/30 block">
                  {st.num}
                </span>
                <h4 className="text-base font-bold text-[#102A43]">{st.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture Section */}
      <section id="security-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#102A43] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> High-Assurance Financial Architecture
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Strict Bank-Grade Invariants & Guardrails
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              In accordance with banking standards, balance amounts are never submitted by client
              browsers. All computations are performed server-side with in-process locks,
              atomic ledger mutation, idempotency token validation, and full audit logs.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-4">
              {[
                'Zero Plaintext Passwords (scrypt-64 hashing)',
                'Daily ATM Withdrawal Limit Checks',
                'Recipient Account Pre-Validation',
                'Dual-Leg Atomic Fund Transfers',
                'Instant Thermal ATM Receipt Generator',
                'Independent Administrator Audit Logging',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Contact Section */}
      <section id="contact-section" className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <h3 className="text-2xl font-bold text-[#102A43]">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500">Need help navigating the bank ATM simulation?</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">Is real money involved in this simulation?</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              No. This is an educational banking simulation platform demonstrating the real internal
              mechanics of automated teller machines, account ledgers, and administrative compliance.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">How do I test transferring money between accounts?</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              You can log in as John Doe (demo customer) and transfer money to Sarah Connor's account number
              (<strong>ACCT-5820-1940-7731</strong>) or Priya Sharma's account number (<strong>ACCT-9102-3341-6508</strong>).
              The system will instantly verify the recipient and atomically update both accounts!
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900">What administrative powers exist?</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Administrators can view all customers, freeze or unfreeze bank accounts, inspect system-wide
              transactions, export daily/weekly financial reports, and inspect the tamper-evident audit log.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-[#102A43]">APEX BANK ATM SIMULATION SYSTEM</span>
          </div>
          <p>© 2026 Apex Digital Bank Simulation. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
