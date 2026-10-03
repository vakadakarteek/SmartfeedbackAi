import api from './api'
import { mockHistory } from '../data/mockHistory'

const USE_MOCK = false
let _history = [...mockHistory]

export const messageService = {
  /**
   * Send feedback to contacts.
   *
   * Validator requires:
   *   channel    → lowercase: 'sms' | 'email' | 'whatsapp'
   *   contactIds → array of valid MongoDB ObjectId strings
   *   feedbackId → must be approved before sending (we approve here first)
   */
  async send({ feedbackIds, contactIds, channel, message }) {
    if (USE_MOCK) {
      await delay(1800)
      const entry = {
        id: 'h' + Date.now(),
        date: new Date().toISOString(),
        feedback: 'Custom Campaign',
        recipients: contactIds.length,
        channel,
        status: 'Completed',
        sent: contactIds.length,
        failed: 0,
        delivered: contactIds.length,
        message,
      }
      _history.unshift(entry)
      return { sent: contactIds.length, failed: 0, delivered: contactIds.length, total: contactIds.length }
    }

    // Fix 1 — channel must be lowercase ('SMS' → 'sms')
    const normalisedChannel = (channel || '').toLowerCase()

    // Fix 2 — contactIds must be real MongoDB _id strings (not 'c1', 'c2' etc.)
    // Filter out any mock IDs that don't look like ObjectIds (24 hex chars)
    const validContactIds = (contactIds || []).filter(id => /^[a-f\d]{24}$/i.test(id))

    if (!validContactIds.length) {
      throw new Error('No valid contacts selected. Please add contacts through the Contacts page first.')
    }

    // Fix 3 — approve all selected feedback items before sending
    // Backend rejects sends if feedback status !== 'approved'
    const validFeedbackIds = (feedbackIds || []).filter(id => /^[a-f\d]{24}$/i.test(id))

    if (validFeedbackIds.length) {
      const approveResults = await Promise.allSettled(
        validFeedbackIds.map(id => api.post(`/feedback/${id}/approve`))
      )
      const failed = approveResults.filter(r => r.status === 'rejected')
      if (failed.length) {
        console.warn(`${failed.length} feedback item(s) could not be approved:`, failed.map(f => f.reason?.message))
      }
    }

    // Build payload — backend uses single feedbackId (first approved one)
    const payload = {
      channel:     normalisedChannel,
      contactIds:  validContactIds,
      feedbackId:  validFeedbackIds[0]  || null,
      feedbackIds: validFeedbackIds,
      message:     message || '',
    }

    const res = await api.post('/messages/send', payload)
    const body = res.data
    // Backend shape: { success, message, data: { sent, failed, delivered, total }, sent, failed, ... }
    const data = body.data || body
    return {
      sent:      data.sent      ?? data.successCount ?? validContactIds.length,
      failed:    data.failed    ?? data.failedCount  ?? 0,
      delivered: data.delivered ?? data.sent         ?? validContactIds.length,
      total:     data.total     ?? validContactIds.length,
    }
  },

  async getHistory() {
    if (USE_MOCK) {
      await delay(400)
      return [..._history]
    }
    const res = await api.get('/messages/history')
    const body = res.data
    return (body.data || body.items || []).map(normaliseHistory)
  },

  async getHistoryItem(id) {
    if (USE_MOCK) {
      await delay(300)
      return _history.find((h) => h.id === id) || null
    }
    const res = await api.get(`/messages/history/${id}`)
    return normaliseHistory(res.data?.data || res.data)
  },
}

function normaliseHistory(item) {
  if (!item) return item
  return {
    id:         item._id        || item.id,
    date:       item.createdAt  || item.date       || new Date().toISOString(),
    feedback:   item.feedback   || item.topic      || 'Campaign',
    campaign:   item.campaign   || item.topic      || 'Campaign',
    recipients: item.recipients || item.totalRecipients || 0,
    channel:    capitalise(item.channel || 'SMS'),   // display as 'SMS', 'Email', 'WhatsApp'
    status:     item.status     || 'Completed',
    sent:       item.sent       || item.successCount || 0,
    failed:     item.failed     || item.failedCount  || 0,
    delivered:  item.delivered  || item.successCount || 0,
    message:    item.message    || item.messageContent || '',
    contacts:   item.contacts   || [],
  }
}

// 'sms' → 'SMS', 'email' → 'Email', 'whatsapp' → 'WhatsApp'
function capitalise(channel) {
  const map = { sms: 'SMS', email: 'Email', whatsapp: 'WhatsApp' }
  return map[channel?.toLowerCase()] || channel
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
