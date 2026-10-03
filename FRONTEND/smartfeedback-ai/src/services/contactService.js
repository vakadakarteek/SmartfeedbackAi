import api from './api'
import { mockContacts } from '../data/mockContacts'

const USE_MOCK = false
let _contacts = [...mockContacts]

export const contactService = {
  async getAll() {
    if (USE_MOCK) {
      await delay(400)
      return [..._contacts]
    }
    const res = await api.get('/contacts')
    // Backend sendPaginated shape: { success, data: contacts[], items: contacts[], pagination }
    const body = res.data
    return (body.data || body.items || body.contacts || []).map(normaliseContact)
  },

  async create(data) {
    if (USE_MOCK) {
      await delay(500)
      const contact = {
        id: 'c' + Date.now(),
        ...data,
        status: 'Active',
        createdAt: new Date().toISOString(),
      }
      _contacts.unshift(contact)
      return contact
    }
    const res = await api.post('/contacts', data)
    // Backend sendSuccess shape: { success, message, data: contact }
    return normaliseContact(res.data?.data || res.data)
  },

  async update(id, data) {
    if (USE_MOCK) {
      await delay(400)
      _contacts = _contacts.map((c) => c.id === id ? { ...c, ...data } : c)
      return _contacts.find((c) => c.id === id)
    }
    const res = await api.put(`/contacts/${id}`, data)
    return normaliseContact(res.data?.data || res.data)
  },

  async delete(id) {
    if (USE_MOCK) {
      await delay(300)
      _contacts = _contacts.filter((c) => c.id !== id)
      return { success: true }
    }
    const res = await api.delete(`/contacts/${id}`)
    return res.data
  },

  async importCSV(contacts) {
    if (USE_MOCK) {
      await delay(800)
      const imported = contacts.map((c, i) => ({
        id: 'c' + Date.now() + i,
        ...c,
        status: 'Active',
        createdAt: new Date().toISOString(),
      }))
      _contacts = [...imported, ..._contacts]
      return { imported: imported.length }
    }
    const res = await api.post('/contacts/import', { contacts })
    return res.data
  },
}

// Normalise a MongoDB contact document to the shape the UI expects
// Keep both id and _id so send workflow can pass real ObjectIds to backend
function normaliseContact(c) {
  if (!c) return c
  const mongoId = c._id?.toString() || c.id
  return {
    id:        mongoId,
    _id:       mongoId,
    name:      c.name  || '',
    phone:     c.phone || '',
    email:     c.email || '',
    tags:      Array.isArray(c.tags) ? c.tags : [],
    status:    c.status || 'Active',
    createdAt: c.createdAt || new Date().toISOString(),
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
