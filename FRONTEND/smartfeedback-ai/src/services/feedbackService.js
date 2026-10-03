import api from './api'
import { generateMockFeedback, generateSingleFeedback, mockFeedbackSessions } from '../data/mockFeedback'

const USE_MOCK = false

export const feedbackService = {
  async generate(params) {
    if (USE_MOCK) {
      await delay(2200)
      return generateMockFeedback(params)
    }

    // Normalise payload — backend validator expects these exact shapes
    const payload = {
      topic:        params.topic,
      description:  params.description || '',
      feedbackCount: parseInt(params.count || params.feedbackCount || 5, 10),
      tone:         params.tone         || 'Professional',
      length:       (params.length || 'medium').toLowerCase(), // Short→short etc.
      language:     params.language     || 'English',
      style:        params.style        || 'General',
      keywords:     Array.isArray(params.keywords)  ? params.keywords  : [],
      avoidTopics:  Array.isArray(params.avoid)     ? params.avoid     :
                    Array.isArray(params.avoidTopics) ? params.avoidTopics : [],
      audience:     Array.isArray(params.audience)
                      ? params.audience.join(', ')
                      : (params.audience || ''),
    }

    const res = await api.post('/feedback/generate', payload)
    const body = res.data

    // Backend shape: { success, message, data: { generation, feedback }, items: [...], sessionId }
    const items = body.items || body.data?.feedback || body.data?.items || []
    const sessionId = body.sessionId || body.data?.sessionId || body.data?.generation?._id || 'live'
    const topic = payload.topic

    return {
      sessionId,
      topic,
      count:    items.length,
      tone:     payload.tone,
      language: payload.language,
      items:    items.map(normaliseItem),
    }
  },

  async getAll() {
    if (USE_MOCK) {
      await delay(500)
      return mockFeedbackSessions
    }
    const res = await api.get('/feedback')
    const body = res.data
    // Returns paginated list of individual feedback items — group into one session for display
    const items = (body.data || body.items || []).map(normaliseItem)
    if (!items.length) return []
    return [{
      sessionId: 'history',
      topic:     items[0]?.topic || 'Feedback',
      count:     items.length,
      tone:      items[0]?.tone  || 'Professional',
      language:  items[0]?.language || 'English',
      items,
    }]
  },

  async update(id, updates) {
    if (USE_MOCK) {
      await delay(400)
      return { id, ...updates }
    }
    const res = await api.put(`/feedback/${id}`, {
      content: updates.text || updates.content,
      isEdited: true,
    })
    return normaliseItem(res.data?.data || res.data)
  },

  async delete(id) {
    if (USE_MOCK) {
      await delay(300)
      return { success: true }
    }
    const res = await api.delete(`/feedback/${id}`)
    return res.data
  },

  async regenerateOne(id, params) {
    if (USE_MOCK) {
      await delay(1500)
      return generateSingleFeedback(params)
    }
    const res = await api.post(`/feedback/${id}/regenerate`, {
      tone:     params.tone,
      length:   (params.length || 'medium').toLowerCase(),
      language: params.language,
    })
    return normaliseItem(res.data?.data || res.data)
  },
}

// Normalise a backend Feedback document to the shape the UI expects
function normaliseItem(item) {
  if (!item) return item
  return {
    id:        item._id || item.id,
    text:      item.content || item.text || '',
    topic:     item.topic    || '',
    tone:      item.tone     || 'Professional',
    language:  item.language || 'English',
    edited:    item.isEdited || item.edited || false,
    createdAt: item.createdAt || new Date().toISOString(),
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
