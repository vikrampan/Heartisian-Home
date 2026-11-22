import { useEffect, useRef, useState, type ReactNode } from 'react'
import { checkRegistration, type RegistrationForm } from '../../api/_lib/validate.js'
import { useDialog } from '../site/hooks/useDialog'
import { ApiError, BACKGROUNDS, EXPERIENCE, dateRange, navigate, post, rupees, type Workshop } from './lib'
import { Icon, PRIMARY, SECONDARY, Spinner } from './ui'

// Registration in four steps, in a sheet over the workshop page. What has been typed is kept for this browser tab,
// so closing the sheet by mistake loses nothing.

type Form = Omit<RegistrationForm, 'slug'>

const EMPTY: Form = {
  name: '',
  email: '',
  phone: '',
  city: '',
  background: '',
  background_other: '',
  experience: '',
  organisation: '',
  motivation: '',
  heard_from: '',
  needs_stay: false,
  food_needs: '',
  emergency_name: '',
  emergency_phone: '',
  age_confirmed: false,
  rules_agreed: false,
  safety_agreed: false,
  photo_consent: false,
  website: '',
}

const STEPS: { label: string; fields: (keyof Form)[] }[] = [
  { label: 'You', fields: ['name', 'email', 'phone', 'city', 'age_confirmed'] },
  { label: 'Background', fields: ['background', 'background_other', 'experience', 'organisation', 'motivation', 'heard_from'] },
  { label: 'Practical', fields: ['needs_stay', 'food_needs', 'emergency_name', 'emergency_phone'] },
  { label: 'Review', fields: ['rules_agreed', 'safety_agreed', 'photo_consent'] },
]

const HEARD = ['A friend or colleague', 'Instagram', 'WhatsApp', 'At Kanha Shanti Vanam', 'A web search', 'Other']

function load(slug: string): Form {
  try {
    const saved = sessionStorage.getItem(`register:${slug}`)
    return saved ? { ...EMPTY, ...(JSON.parse(saved) as Partial<Form>) } : EMPTY
  } catch {
    return EMPTY
  }
}

export default function RegisterSheet({ workshop: w, open, onClose }: { workshop: Workshop; open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<Form>(() => load(w.slug))
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const [duplicate, setDuplicate] = useState('')
  const ref = useDialog(open, onClose)
  const body = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(`register:${w.slug}`, JSON.stringify(form))
    } catch {
      // private browsing: the form still works, it just isn't kept
    }
  }, [form, w.slug])

  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
  }, [step])

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      const { [key]: _gone, ...rest } = e
      return rest
    })
  }

  const stepErrors = (i: number) => {
    const { errors: all } = checkRegistration({ ...form, slug: w.slug })
    return Object.fromEntries(Object.entries(all).filter(([k]) => STEPS[i].fields.includes(k as keyof Form)))
  }

  const next = () => {
    const found = stepErrors(step)
    setErrors(found)
    if (Object.keys(found).length) {
      body.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setStep(step + 1)
  }

  async function submit() {
    const found = stepErrors(3)
    setErrors(found)
    if (Object.keys(found).length) return
    setBusy(true)
    setProblem('')
    try {
      const result = await post<{ token?: string; duplicate?: boolean; email?: string }>('register', { ...form, slug: w.slug })
      sessionStorage.removeItem(`register:${w.slug}`)
      if (result.duplicate) {
        setDuplicate(result.email ?? form.email)
        return
      }
      navigate(`/booking/${result.token}?new=1`)
    } catch (e) {
      const err = e as ApiError
      setProblem(err.message)
      if (err.fields && Object.keys(err.fields).length) {
        setErrors(err.fields)
        const first = STEPS.findIndex((s) => s.fields.some((f) => err.fields[f]))
        if (first >= 0) setStep(first)
      }
    } finally {
      setBusy(false)
    }
  }

  const full = w.seats_left === 0
  const submitLabel = full ? 'Join the waitlist' : w.fee_inr ? 'Reserve my place' : 'Confirm registration'

  return (
    <div className={open ? '' : 'pointer-events-none'} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[69] bg-ink/55 transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-[36rem] flex-col bg-paper shadow-[-30px_0_60px_-30px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-soft ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="moss px-5 pb-5 pt-5 text-paper sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow text-clay">Register</p>
              <h2 id="register-title" className="mt-1.5 font-display text-[1.35rem] leading-snug">{w.title}</h2>
              <p className="mt-1 text-sm text-paper/75">
                {dateRange(w.starts_on, w.ends_on)} · {w.fee_inr ? rupees(w.fee_inr) : 'Free'}
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-paper/10">
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>
          {!duplicate && (
            <ol className="mt-5 grid grid-cols-4 gap-1.5" aria-label="Steps">
              {STEPS.map((s, i) => (
                <li key={s.label} aria-current={i === step ? 'step' : undefined}>
                  <span
                    aria-hidden="true"
                    className={`block h-2.5 rounded-[2px] ${
                      i < step
                        ? 'bg-[linear-gradient(160deg,#c07a50,#9f5738)]'
                        : i === step
                          ? 'bg-clay'
                          : 'border border-dashed border-paper/40'
                    }`}
                  />
                  <span className={`mt-1.5 block text-xs ${i === step ? 'font-semibold text-paper' : 'text-paper/60'}`}>
                    {i + 1}. {s.label}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </header>

        <div ref={body} className="flex-1 overflow-y-auto px-5 py-7 sm:px-8">
          {duplicate ? (
            <div className="py-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-tan text-terracotta">
                <Icon name="check" className="h-7 w-7" />
              </span>
              <h3 className="mt-5 font-display text-2xl text-ink">You are already registered</h3>
              <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
                We have sent the link to your booking to <strong className="text-ink">{duplicate}</strong>. It has your
                status and everything else you need.
              </p>
            </div>
          ) : (
            <>
              {/* people never see this; automated sign-ups fill it in */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                aria-hidden="true"
              />
              {step === 0 && <StepYou form={form} set={set} errors={errors} />}
              {step === 1 && <StepBackground form={form} set={set} errors={errors} />}
              {step === 2 && <StepPractical form={form} set={set} errors={errors} />}
              {step === 3 && <StepReview form={form} set={set} errors={errors} w={w} goTo={setStep} />}
              {problem && (
                <p role="alert" className="mt-6 rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
                  {problem}
                </p>
              )}
            </>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink/10 bg-paper px-5 py-4 sm:px-8">
          {duplicate ? (
            <button type="button" onClick={onClose} className={`${PRIMARY} ml-auto h-12 px-7`}>
              Done
            </button>
          ) : (
            <>
              {step > 0 ? (
                <button type="button" onClick={() => setStep(step - 1)} className={`${SECONDARY} h-12 px-6`}>
                  Back
                </button>
              ) : (
                <span className="text-xs text-muted">About 3 minutes</span>
              )}
              {step < 3 ? (
                <button type="button" onClick={next} className={`${PRIMARY} h-12 px-7`}>
                  Continue
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={busy} className={`${PRIMARY} h-12 px-7`}>
                  {busy && <Spinner className="h-4 w-4" />}
                  {busy ? 'Sending' : submitLabel}
                </button>
              )}
            </>
          )}
        </footer>
      </div>
    </div>
  )
}

// ---- steps ----

interface StepProps {
  form: Form
  set: <K extends keyof Form>(key: K, value: Form[K]) => void
  errors: Record<string, string>
}

function StepYou({ form, set, errors }: StepProps) {
  return (
    <Fieldset title="About you" intro="We use these to send your booking and to reach you about the workshop.">
      <Text label="Full name" field="name" value={form.name} set={set} errors={errors} autoComplete="name" />
      <Text label="Email" field="email" type="email" value={form.email} set={set} errors={errors} autoComplete="email" inputMode="email" />
      <Text label="Phone / WhatsApp" field="phone" type="tel" value={form.phone} set={set} errors={errors} autoComplete="tel" inputMode="tel" />
      <Text label="City or town you are coming from" field="city" value={form.city} set={set} errors={errors} autoComplete="address-level2" />
      <Check field="age_confirmed" checked={form.age_confirmed} set={set} errors={errors}>
        I am 18 or older
      </Check>
    </Fieldset>
  )
}

function StepBackground({ form, set, errors }: StepProps) {
  return (
    <Fieldset title="Your background" intro="This helps the trainers pitch the workshop to the group.">
      <Choices
        label="What describes you best?"
        field="background"
        value={form.background}
        options={Object.entries(BACKGROUNDS)}
        set={set}
        errors={errors}
      />
      {form.background === 'other' && (
        <Text label="Tell us a little more" field="background_other" value={form.background_other} set={set} errors={errors} />
      )}
      <Choices
        label="Your experience of building"
        field="experience"
        value={form.experience}
        options={Object.entries(EXPERIENCE)}
        set={set}
        errors={errors}
        columns={1}
      />
      <Text label="Organisation, college or firm" optional field="organisation" value={form.organisation} set={set} errors={errors} autoComplete="organization" />
      <Area label="Why would you like to join?" optional field="motivation" value={form.motivation} set={set} errors={errors} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">
          How did you hear about us? <span className="font-normal text-muted">(optional)</span>
        </span>
        <select
          value={form.heard_from}
          onChange={(e) => set('heard_from', e.target.value)}
          className="h-12 w-full rounded-xl border border-ink/15 bg-white px-4 text-base text-ink outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
        >
          <option value="">Choose one</option>
          {HEARD.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </select>
      </label>
    </Fieldset>
  )
}

function StepPractical({ form, set, errors }: StepProps) {
  return (
    <Fieldset title="Practical details" intro="So that your days at Kanha go smoothly.">
      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink">Would you like help arranging a stay at Kanha?</p>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            [true, 'Yes, please'],
            [false, 'No, I have it sorted'],
          ].map(([value, label]) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={form.needs_stay === value}
              onClick={() => set('needs_stay', value as boolean)}
              className={`rounded-xl border px-4 py-3 text-left text-[0.9375rem] transition-colors ${
                form.needs_stay === value ? 'border-terracotta bg-terracotta/8 font-semibold text-ink ring-1 ring-terracotta' : 'border-ink/15 bg-white text-ink hover:border-ink/40'
              }`}
            >
              {label as string}
            </button>
          ))}
        </div>
      </div>
      <Text label="Allergies or food needs" optional field="food_needs" value={form.food_needs} set={set} errors={errors} />
      <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-ink/8 sm:p-5">
        <p className="text-sm font-semibold text-ink">Emergency contact</p>
        <p className="mt-0.5 text-sm text-muted">Someone we can call if anything happens during the workshop.</p>
        <div className="mt-4 space-y-4">
          <Text label="Their name" field="emergency_name" value={form.emergency_name} set={set} errors={errors} />
          <Text label="Their phone" field="emergency_phone" type="tel" value={form.emergency_phone} set={set} errors={errors} inputMode="tel" />
        </div>
      </div>
    </Fieldset>
  )
}

function StepReview({ form, set, errors, w, goTo }: StepProps & { w: Workshop; goTo: (step: number) => void }) {
  const full = w.seats_left === 0
  const next = full
    ? 'The workshop is full, so you will join the waitlist. If a place opens up, we will email you straight away.'
    : w.fee_inr
      ? `We will hold your place for ${w.hold_hours_effective} hours. Your booking page will show a UPI QR code for ${rupees(w.fee_inr)}; once you pay and send us the reference, we confirm your place by email.`
      : 'Your place is confirmed straight away, and we will email you the details with a calendar invite.'
  const rows: [string, string, number][] = [
    ['Name', form.name, 0],
    ['Email', form.email, 0],
    ['Phone', form.phone, 0],
    ['From', form.city, 0],
    ['Background', form.background === 'other' ? form.background_other : (BACKGROUNDS[form.background] ?? ''), 1],
    ['Experience', EXPERIENCE[form.experience] ?? '', 1],
    ['Stay at Kanha', form.needs_stay ? 'Would like help' : 'Not needed', 2],
    ['Emergency contact', `${form.emergency_name} · ${form.emergency_phone}`, 2],
  ]
  return (
    <Fieldset title="Check and agree" intro="Please check your details.">
      <dl className="divide-y divide-ink/8 rounded-2xl bg-white/60 ring-1 ring-ink/8">
        {rows.map(([k, v, s]) => (
          <div key={k} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <dt className="text-xs uppercase tracking-[0.1em] text-muted">{k}</dt>
              <dd className="mt-0.5 break-words text-[0.9375rem] text-ink">{v || '—'}</dd>
            </div>
            <button type="button" onClick={() => goTo(s)} className="shrink-0 text-sm font-semibold text-terracotta underline-offset-4 hover:underline">
              Edit
            </button>
          </div>
        ))}
      </dl>
      <div className="rounded-2xl bg-moss p-5 text-paper">
        <p className="eyebrow text-clay">What happens next</p>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-paper/90">{next}</p>
      </div>
      <Check field="rules_agreed" checked={form.rules_agreed} set={set} errors={errors}>
        I will follow the campus rules: Kanha Shanti Vanam is free of alcohol, smoking and tobacco.
      </Check>
      <Check field="safety_agreed" checked={form.safety_agreed} set={set} errors={errors}>
        I will follow the trainers' safety instructions. I understand the practical work is introductory and supervised.
      </Check>
      <Check field="photo_consent" checked={form.photo_consent} set={set} errors={errors} optional>
        Heartisan Home may share photos of me taken during the workshop.
      </Check>
    </Fieldset>
  )
}

// ---- fields ----

function Fieldset({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-[1.65rem] leading-tight text-ink">{title}</h3>
      <p className="mt-1.5 text-[0.9375rem] text-muted">{intro}</p>
      <div className="mt-6 space-y-5">{children}</div>
    </div>
  )
}

const errorId = (field: string) => `err-${field}`

function FieldError({ field, errors }: { field: string; errors: Record<string, string> }) {
  if (!errors[field]) return null
  return (
    <p id={errorId(field)} className="mt-1.5 text-sm text-terracotta">
      {errors[field]}
    </p>
  )
}

const INPUT =
  'w-full rounded-xl border bg-white px-4 text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20'

type TextField = 'name' | 'email' | 'phone' | 'city' | 'background_other' | 'organisation' | 'food_needs' | 'emergency_name' | 'emergency_phone'

function Text({
  label,
  field,
  value,
  set,
  errors,
  optional,
  type = 'text',
  autoComplete,
  inputMode,
}: {
  label: string
  field: TextField
  value: string
  set: StepProps['set']
  errors: Record<string, string>
  optional?: boolean
  type?: string
  autoComplete?: string
  inputMode?: 'email' | 'tel'
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => set(field, e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={errors[field] ? true : undefined}
        aria-describedby={errors[field] ? errorId(field) : undefined}
        className={`${INPUT} h-12 ${errors[field] ? 'border-terracotta' : 'border-ink/15'}`}
      />
      <FieldError field={field} errors={errors} />
    </label>
  )
}

function Area({ label, field, value, set, errors, optional }: { label: string; field: 'motivation'; value: string; set: StepProps['set']; errors: Record<string, string>; optional?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </span>
      <textarea value={value} rows={3} onChange={(e) => set(field, e.target.value)} className={`${INPUT} border-ink/15 py-3`} />
      <FieldError field={field} errors={errors} />
    </label>
  )
}

function Choices({
  label,
  field,
  value,
  options,
  set,
  errors,
  columns = 2,
}: {
  label: string
  field: 'background' | 'experience'
  value: string
  options: [string, string][]
  set: StepProps['set']
  errors: Record<string, string>
  columns?: 1 | 2
}) {
  return (
    <fieldset aria-describedby={errors[field] ? errorId(field) : undefined}>
      <legend className="mb-1.5 text-sm font-semibold text-ink">{label}</legend>
      <div className={`grid gap-2.5 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
        {options.map(([key, text]) => (
          <label
            key={key}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[0.9375rem] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-terracotta/40 ${
              value === key ? 'border-terracotta bg-terracotta/8 font-semibold text-ink ring-1 ring-terracotta' : errors[field] ? 'border-terracotta/60 bg-white' : 'border-ink/15 bg-white hover:border-ink/40'
            }`}
          >
            <input
              type="radio"
              name={field}
              value={key}
              checked={value === key}
              onChange={() => set(field, key)}
              aria-invalid={errors[field] ? true : undefined}
              className="h-4 w-4 accent-[#9f5738]"
            />
            {text}
          </label>
        ))}
      </div>
      <FieldError field={field} errors={errors} />
    </fieldset>
  )
}

function Check({
  field,
  checked,
  set,
  errors,
  optional,
  children,
}: {
  field: 'age_confirmed' | 'rules_agreed' | 'safety_agreed' | 'photo_consent'
  checked: boolean
  set: StepProps['set']
  errors: Record<string, string>
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-[0.9375rem] leading-snug text-ink ${errors[field] ? 'border-terracotta' : 'border-ink/15'}`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => set(field, e.target.checked)}
          aria-invalid={errors[field] ? true : undefined}
          aria-describedby={errors[field] ? errorId(field) : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#9f5738]"
        />
        <span>
          {children} {optional && <span className="text-muted">(optional)</span>}
        </span>
      </label>
      <FieldError field={field} errors={errors} />
    </div>
  )
}
