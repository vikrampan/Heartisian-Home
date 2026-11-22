// The registration form's rules, used by the form in the browser and again by the server.

export interface RegistrationForm {
  slug: string
  name: string
  email: string
  phone: string
  city: string
  background: string
  background_other: string
  experience: string
  organisation: string
  motivation: string
  heard_from: string
  needs_stay: boolean
  food_needs: string
  emergency_name: string
  emergency_phone: string
  age_confirmed: boolean
  rules_agreed: boolean
  safety_agreed: boolean
  photo_consent: boolean
  /** a field people never see; bots fill it in */
  website?: string
}

export const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const digits = (v: string) => v.replace(/\D/g, '').length

export function checkRegistration(raw: Partial<RegistrationForm>): { form: RegistrationForm; errors: Record<string, string> } {
  const form: RegistrationForm = {
    slug: str(raw.slug, 120),
    name: str(raw.name, 120),
    email: str(raw.email, 200).toLowerCase(),
    phone: str(raw.phone, 30),
    city: str(raw.city, 120),
    background: str(raw.background, 40),
    background_other: str(raw.background_other, 120),
    experience: str(raw.experience, 20),
    organisation: str(raw.organisation, 200),
    motivation: str(raw.motivation, 2000),
    heard_from: str(raw.heard_from, 200),
    needs_stay: raw.needs_stay === true,
    food_needs: str(raw.food_needs, 500),
    emergency_name: str(raw.emergency_name, 120),
    emergency_phone: str(raw.emergency_phone, 30),
    age_confirmed: raw.age_confirmed === true,
    rules_agreed: raw.rules_agreed === true,
    safety_agreed: raw.safety_agreed === true,
    photo_consent: raw.photo_consent === true,
  }
  const errors: Record<string, string> = {}
  if (form.name.length < 2) errors.name = 'Please enter your full name.'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = 'Please enter a valid email address.'
  if (digits(form.phone) < 8 || digits(form.phone) > 15) errors.phone = 'Please enter a phone number we can reach you on.'
  if (!form.city) errors.city = 'Please tell us where you are coming from.'
  if (!['student', 'mason', 'architect_engineer', 'homeowner', 'entrepreneur', 'other'].includes(form.background)) errors.background = 'Please choose what describes you best.'
  if (form.background === 'other' && !form.background_other) errors.background_other = 'Please tell us a little more.'
  if (!['none', 'some', 'professional'].includes(form.experience)) errors.experience = 'Please choose your experience.'
  if (form.emergency_name.length < 2) errors.emergency_name = 'Please name someone we can contact in an emergency.'
  if (digits(form.emergency_phone) < 8 || digits(form.emergency_phone) > 15) errors.emergency_phone = 'Please enter their phone number.'
  if (!form.age_confirmed) errors.age_confirmed = 'The workshop is for people aged 18 and over.'
  if (!form.rules_agreed) errors.rules_agreed = 'Please agree to the campus rules.'
  if (!form.safety_agreed) errors.safety_agreed = 'Please agree to work safely under supervision.'
  return { form, errors }
}

