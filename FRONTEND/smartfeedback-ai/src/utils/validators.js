export const validators = {
  required: (value) => {
    if (!value || String(value).trim() === '') return 'This field is required.'
    return null
  },

  email: (value) => {
    if (!value) return 'Email is required.'
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(value) ? null : 'Enter a valid email address.'
  },

  phone: (value) => {
    if (!value) return 'Phone number is required.'
    const digits = value.replace(/\D/g, '')
    if (digits.length < 10) return 'Enter a valid phone number (at least 10 digits).'
    return null
  },

  password: (value) => {
    if (!value) return 'Password is required.'
    if (value.length < 8) return 'Password must be at least 8 characters.'
    return null
  },

  minLength: (min) => (value) => {
    if (!value || value.length < min) return `Must be at least ${min} characters.`
    return null
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) return `Must not exceed ${max} characters.`
    return null
  },
}

/**
 * Validate a CSV row for contact import.
 * Returns { valid: true } or { valid: false, reason: string }
 */
export function validateContactRow(row) {
  if (!row.name || String(row.name).trim() === '') {
    return { valid: false, reason: 'Missing name' }
  }
  const hasPhone = row.phone && /\d{10}/.test(row.phone.replace(/\D/g, ''))
  const hasEmail = row.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)
  if (!hasPhone && !hasEmail) {
    return { valid: false, reason: 'Needs a valid phone or email' }
  }
  return { valid: true }
}
