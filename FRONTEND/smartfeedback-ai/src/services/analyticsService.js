import api from './api'
import { mockAnalytics } from '../data/mockAnalytics'

const USE_MOCK = false

export const analyticsService = {
  async getSummary() {
    if (USE_MOCK) {
      await delay(500)
      return mockAnalytics.summary
    }
    const res = await api.get('/analytics/overview')
    const body = res.data
    // Backend spreads summary fields into the top-level response via sendSuccess extra
    // Shape: { success, message, data: {...summary}, ...summary }
    const src = body.data || body
    return {
      totalFeedbackGenerated:  src.totalFeedbackGenerated  ?? src.totalGenerations    ?? 0,
      totalMessagesSent:       src.totalMessagesSent       ?? src.totalMessages        ?? 0,
      successfulDeliveries:    src.successfulDeliveries    ?? src.successCount         ?? 0,
      failedMessages:          src.failedMessages          ?? src.failedCount          ?? 0,
      activeContacts:          src.activeContacts          ?? src.totalContacts        ?? 0,
      successRate:             src.successRate             ?? src.deliveryRate         ?? 0,
    }
  },

  async getCharts() {
    if (USE_MOCK) {
      await delay(600)
      return mockAnalytics.charts
    }
    const res = await api.get('/analytics/charts')
    const body = res.data
    const src = body.data || body

    // Normalise chart arrays — fall back to mock if backend returns empty/null
    return {
      feedbackOverTime:    normaliseArr(src.feedbackOverTime)    || mockAnalytics.charts.feedbackOverTime,
      messagesOverTime:    normaliseArr(src.messagesOverTime)    || mockAnalytics.charts.messagesOverTime,
      channelDistribution: normaliseArr(src.channelDistribution) || mockAnalytics.charts.channelDistribution,
      sendingOutcome:      normaliseArr(src.sendingOutcome)      || mockAnalytics.charts.sendingOutcome,
      toneDistribution:    normaliseArr(src.toneDistribution)    || mockAnalytics.charts.toneDistribution,
    }
  },
}

function normaliseArr(arr) {
  return Array.isArray(arr) && arr.length > 0 ? arr : null
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
