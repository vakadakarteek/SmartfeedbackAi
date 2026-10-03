import { Link } from 'react-router-dom'
import {
  MessageSquareText, Zap, Edit3, Users, Send, BarChart2,
  History, ChevronRight, Check, ArrowRight
} from 'lucide-react'

// ─── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center">
            <MessageSquareText size={14} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">
            SmartFeedback <span className="text-brand-600">AI</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {['Home', 'How It Works', 'Features', 'About'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="btn-primary text-sm px-4 py-2"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-16 pb-20 px-4 sm:px-6" id="home">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              <span className="text-xs font-medium text-brand-700">AI-powered feedback generation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Create feedback drafts<br />
              <span className="text-brand-600">in seconds.</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-md">
              Generate unique feedback drafts with AI, review them, and share approved messages with your contacts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="btn-primary gap-2">
                Start Generating
                <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                See How It Works
              </a>
            </div>

            <div className="mt-8 flex items-center gap-6">
              {[
                { label: 'Feedback Generated', value: '12,000+' },
                { label: 'Active Users',        value: '800+'    },
                { label: 'Success Rate',        value: '96%'     },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product preview */}
          <div className="lg:pl-6">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductPreview() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-card-lg overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-slate-400 font-mono">smartfeedback.ai/generate</span>
      </div>

      {/* Form preview */}
      <div className="p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Feedback Generator</p>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Topic</p>
            <div className="input-base text-sm py-2 text-slate-800">College Technical Workshop</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Feedback count</p>
              <div className="input-base text-sm py-2 text-slate-800">10</div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Tone</p>
              <div className="input-base text-sm py-2 text-slate-800">Professional</div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Language</p>
            <div className="input-base text-sm py-2 text-slate-800">English</div>
          </div>
        </div>

        <button className="btn-primary w-full text-sm justify-center mb-4">
          <Zap size={14} />
          Generate Feedback
        </button>

        {/* Generated samples */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">Generated — 10 drafts</p>
          {[
            'The technical workshop was well-structured and covered relevant topics in an accessible way…',
            'Attending this workshop gave me a practical perspective on technologies I had only read about…',
            'The workshop content was current and industry-relevant. The balance between theory and…',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-brand-600 mt-0.5 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{text}</p>
            </div>
          ))}
          <p className="text-xs text-center text-slate-400 pt-1">+ 7 more drafts</p>
        </div>
      </div>
    </div>
  )
}

// ─── How It Works ───────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Enter Details',
      desc: 'Provide the topic, tone, language, and number of feedback drafts you need.',
      icon: Edit3,
    },
    {
      number: '02',
      title: 'Generate Feedback',
      desc: 'The AI creates multiple unique feedback drafts based on your requirements.',
      icon: Zap,
    },
    {
      number: '03',
      title: 'Review & Edit',
      desc: 'Read each draft, edit the ones you want, regenerate others, and select the best.',
      icon: MessageSquareText,
    },
    {
      number: '04',
      title: 'Share with Contacts',
      desc: 'Send approved feedback to selected contacts via SMS, Email, or WhatsApp.',
      icon: Send,
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Process</p>
          <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
          <p className="mt-2 text-slate-500 max-w-md">
            Four simple steps from idea to delivered feedback.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-1/2 w-full h-px bg-slate-200 z-0" />
              )}

              <div className="relative z-10 flex flex-col items-start lg:items-center text-left lg:text-center p-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-card mb-4">
                  <step.icon size={22} className="text-brand-600" />
                </div>
                <span className="text-xs font-bold text-brand-500 mb-1">{step.number}</span>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ───────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Zap,
      title: 'AI Feedback Generation',
      desc: 'Generate multiple feedback drafts based on your topic, tone, length, and language preferences.',
    },
    {
      icon: Edit3,
      title: 'Review & Edit',
      desc: 'Each draft is editable. Modify content, regenerate individual items, or delete what you don\'t need.',
    },
    {
      icon: Users,
      title: 'Contact Management',
      desc: 'Store contacts with phone and email. Tag them by group for easy selection when sending.',
    },
    {
      icon: Send,
      title: 'Multi-Channel Sharing',
      desc: 'Send approved feedback via SMS, Email, or WhatsApp with an explicit confirmation step.',
    },
    {
      icon: History,
      title: 'Sending History',
      desc: 'Every send is logged. Review what was sent, to whom, through which channel, and the delivery status.',
    },
    {
      icon: BarChart2,
      title: 'Analytics',
      desc: 'Track generation volume, message delivery rates, channel usage, and tone distribution over time.',
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-2">Features</p>
          <h2 className="text-3xl font-bold text-slate-900">Everything you need</h2>
          <p className="mt-2 text-slate-500 max-w-md">
            A complete workflow for generating, reviewing, and sharing feedback.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <f.icon size={17} className="text-brand-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ─────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-16 bg-brand-600">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Ready to generate your first feedback?
        </h2>
        <p className="text-brand-200 mb-8 text-sm">
          Create an account and start generating feedback drafts in under a minute.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-6 py-3 rounded-lg hover:bg-brand-50 transition-colors text-sm"
        >
          Create Free Account
          <ChevronRight size={16} />
        </Link>
      </div>
    </section>
  )
}

// ─── Footer ─────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
            <MessageSquareText size={12} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-300">SmartFeedback AI</span>
        </div>
        <p className="text-xs">
          © {new Date().getFullYear()} SmartFeedback AI. All drafts are AI-generated and should be reviewed before sharing.
        </p>
      </div>
    </footer>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <CTABanner />
      <Footer />
    </div>
  )
}
