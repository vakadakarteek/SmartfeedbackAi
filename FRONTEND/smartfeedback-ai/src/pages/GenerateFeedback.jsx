import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { feedbackService } from '../services/feedbackService'
import { useToast } from '../context/ToastContext'

// ─── Field config ────────────────────────────────────────────────────────────
const TONES = [
  { value: 'Professional',  label: 'Professional'  },
  { value: 'Positive',      label: 'Positive'      },
  { value: 'Neutral',       label: 'Neutral'        },
  { value: 'Constructive',  label: 'Constructive'  },
  { value: 'Casual',        label: 'Casual'         },
]

const LENGTHS = [
  { value: 'Short',    label: 'Short'    },
  { value: 'Medium',   label: 'Medium'   },
  { value: 'Detailed', label: 'Detailed' },
]

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Telugu',  label: 'Telugu'  },
  { value: 'Hindi',   label: 'Hindi'   },
]

const COUNTS = [1, 5, 10, 20, 50]

const STYLES = [
  { value: 'General',                label: 'General'                },
  { value: 'Event Experience',       label: 'Event Experience'       },
  { value: 'Product Experience',     label: 'Product Experience'     },
  { value: 'Service Experience',     label: 'Service Experience'     },
  { value: 'Learning Experience',    label: 'Learning Experience'    },
  { value: 'Constructive Suggestions', label: 'Constructive Suggestions' },
]

const AUDIENCE_OPTIONS = [
  'College Students', 'School Students', 'Faculty', 'Corporate Employees',
  'Customers', 'General Public', 'Management', 'Researchers',
]

// ─── Sub-components ──────────────────────────────────────────────────────────
function FieldLabel({ children, required, hint }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="label mb-0">
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && (
        <div className="relative group">
          <Info size={13} className="text-slate-400 cursor-help" />
          <div className="absolute left-5 top-0 z-10 hidden group-hover:block w-52 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
            {hint}
          </div>
        </div>
      )}
    </div>
  )
}

function CountSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {COUNTS.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-12 h-10 rounded-lg border text-sm font-medium transition-colors ${
            value === n
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function TagInput({ value = [], onChange, suggestions = [] }) {
  const [input, setInput] = useState('')

  function add(tag) {
    const clean = tag.trim()
    if (clean && !value.includes(clean)) {
      onChange([...value, clean])
    }
    setInput('')
  }

  function remove(tag) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleKey(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      add(input)
    } else if (e.key === 'Backspace' && !input && value.length) {
      remove(value[value.length - 1])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-xs font-medium text-brand-700">
            {tag}
            <button type="button" onClick={() => remove(tag)} className="hover:text-brand-900 ml-0.5" aria-label={`Remove ${tag}`}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type and press Enter"
        className="input-base text-sm"
      />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.filter((s) => !value.includes(s)).slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="px-2.5 py-1 rounded-full border border-slate-200 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  topic: '',
  description: '',
  count: 10,
  tone: 'Professional',
  length: 'Medium',
  language: 'English',
  style: 'General',
  audience: [],
  keywords: [],
  avoid: [],
}

export default function GenerateFeedback() {
  const { toast } = useToast()
  const navigate  = useNavigate()

  const [form, setForm]             = useState(INITIAL_FORM)
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)
  const [showAdvanced, setAdvanced] = useState(false)

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }

  function validate() {
    const e = {}
    if (!form.topic.trim()) e.topic = 'Topic is required.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const result = await feedbackService.generate(form)
      // Store in sessionStorage for FeedbackList page to pick up
      sessionStorage.setItem('sf_generated', JSON.stringify(result))
      toast.success(`${result.items.length} feedback drafts generated.`)
      navigate('/feedback', { state: { fromGenerate: true } })
    } catch (err) {
      toast.error(err.message || 'Failed to generate feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="page-title">Generate Feedback</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell us what you're collecting feedback about. We'll create editable drafts for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* ── Section: Core details ── */}
        <section className="card p-6 space-y-5">
          <h2 className="section-title border-b border-slate-100 pb-3">About the feedback</h2>

          {/* Topic */}
          <div>
            <FieldLabel required hint="The subject or event you're collecting feedback about">Topic</FieldLabel>
            <input
              type="text"
              value={form.topic}
              onChange={(e) => set('topic', e.target.value)}
              placeholder="e.g. College Technical Workshop, Product Launch, Customer Service"
              className={`input-base ${errors.topic ? 'input-error' : ''}`}
              aria-invalid={!!errors.topic}
            />
            {errors.topic && <p className="mt-1.5 text-xs text-red-600" role="alert">{errors.topic}</p>}
          </div>

          {/* Description */}
          <div>
            <FieldLabel hint="Additional context about the event, product, or activity">Description</FieldLabel>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Briefly describe the event, product, service, or activity. The more context you provide, the more relevant the feedback will be."
              className="input-base resize-none"
            />
          </div>

          {/* Count */}
          <div>
            <FieldLabel hint="How many individual feedback drafts to generate">Number of feedbacks</FieldLabel>
            <CountSelector value={form.count} onChange={(v) => set('count', v)} />
          </div>
        </section>

        {/* ── Section: Style & tone ── */}
        <section className="card p-6 space-y-5">
          <h2 className="section-title border-b border-slate-100 pb-3">Style & tone</h2>

          {/* Tone */}
          <div>
            <FieldLabel>Tone</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('tone', t.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors ${
                    form.tone === t.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div>
            <FieldLabel>Length</FieldLabel>
            <SegmentedControl value={form.length} onChange={(v) => set('length', v)} options={LENGTHS} />
          </div>

          {/* Language */}
          <div>
            <FieldLabel>Language</FieldLabel>
            <div className="flex gap-2 flex-wrap">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => set('language', lang.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    form.language === lang.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Style */}
          <div>
            <FieldLabel hint="The type of feedback perspective to generate">Feedback style</FieldLabel>
            <div className="relative">
              <select
                value={form.style}
                onChange={(e) => set('style', e.target.value)}
                className="input-base appearance-none pr-9"
              >
                {STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ── Advanced options (collapsible) ── */}
        <section className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
            aria-expanded={showAdvanced}
          >
            <div>
              <span className="text-sm font-semibold text-slate-800">Advanced options</span>
              <span className="ml-2 text-xs text-slate-400">Audience, keywords, constraints</span>
            </div>
            {showAdvanced ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          {showAdvanced && (
            <div className="px-6 pb-6 space-y-5 border-t border-slate-100 pt-5">
              {/* Audience */}
              <div>
                <FieldLabel hint="Who will be providing or reading this feedback">Audience type</FieldLabel>
                <TagInput
                  value={form.audience}
                  onChange={(v) => set('audience', v)}
                  suggestions={AUDIENCE_OPTIONS}
                />
              </div>

              {/* Keywords */}
              <div>
                <FieldLabel hint="Specific terms or topics the feedback should mention">Keywords to include</FieldLabel>
                <TagInput
                  value={form.keywords}
                  onChange={(v) => set('keywords', v)}
                />
                <p className="mt-1.5 text-xs text-slate-400">e.g. Practical sessions, speakers, technology</p>
              </div>

              {/* Avoid */}
              <div>
                <FieldLabel hint="Topics or phrases to exclude from the generated feedback">Things to avoid</FieldLabel>
                <TagInput
                  value={form.avoid}
                  onChange={(v) => set('avoid', v)}
                />
                <p className="mt-1.5 text-xs text-slate-400">e.g. Inventing specific event details, negative tone</p>
              </div>
            </div>
          )}
        </section>

        {/* ── AI draft notice ── */}
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            <span className="font-medium">AI-generated drafts</span> — All output is a starting point for review. Edit or discard any draft before sharing.
          </p>
        </div>

        {/* ── Submit ── */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-3 text-base"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating feedback…
              </>
            ) : (
              <>
                <Zap size={17} />
                Generate Feedback
              </>
            )}
          </button>
          {loading && (
            <p className="text-sm text-slate-500 animate-pulse">
              This usually takes 5–10 seconds…
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
