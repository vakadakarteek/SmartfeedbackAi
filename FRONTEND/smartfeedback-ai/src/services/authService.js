import api from './api'
import { mockUsers } from '../data/mockUsers'

const USE_MOCK = false // backend is live

export const authService = {
  async login(email, password) {
    if (USE_MOCK) {
      await delay(800)
      const user = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      )
      if (!user || password.length < 3) {
        throw new Error('Invalid email or password.')
      }
      return { user, token: 'mock-jwt-token-' + user.id }
    }
    const res = await api.post('/auth/login', { email, password })
    const body = res.data
    // Backend spreads { token, user } into both data and top-level via sendSuccess extra
    return {
      user:  body.user  || body.data?.user,
      token: body.token || body.data?.token,
    }
  },

  async register(name, email, password) {
    if (USE_MOCK) {
      await delay(900)
      const exists = mockUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      )
      if (exists) throw new Error('An account with this email already exists.')
      const user = {
        id: 'u' + Date.now(),
        name,
        email,
        phone: '',
        createdAt: new Date().toISOString(),
        avatar: null,
      }
      return { user, token: 'mock-jwt-token-' + user.id }
    }
    const res = await api.post('/auth/register', { name, email, password })
    const body = res.data
    return {
      user:  body.user  || body.data?.user,
      token: body.token || body.data?.token,
    }
  },

  async forgotPassword(email) {
    if (USE_MOCK) {
      await delay(700)
      return { message: 'If that email exists, a reset link has been sent.' }
    }
    const res = await api.post('/auth/forgot-password', { email })
    return res.data
  },
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
