export const mockAnalytics = {
  summary: {
    totalFeedbackGenerated: 128,
    totalMessagesSent: 214,
    successfulDeliveries: 198,
    failedMessages: 16,
    activeContacts: 86,
    successRate: 92.5,
  },
  charts: {
    feedbackOverTime: [
      { month: 'Apr', count: 8  },
      { month: 'May', count: 14 },
      { month: 'Jun', count: 11 },
      { month: 'Jul', count: 19 },
      { month: 'Aug', count: 23 },
      { month: 'Sep', count: 31 },
    ],
    messagesOverTime: [
      { month: 'Apr', sent: 18,  delivered: 16 },
      { month: 'May', sent: 28,  delivered: 26 },
      { month: 'Jun', sent: 22,  delivered: 20 },
      { month: 'Jul', sent: 35,  delivered: 33 },
      { month: 'Aug', sent: 42,  delivered: 38 },
      { month: 'Sep', sent: 69,  delivered: 65 },
    ],
    channelDistribution: [
      { name: 'SMS',      value: 48 },
      { name: 'Email',    value: 35 },
      { name: 'WhatsApp', value: 17 },
    ],
    sendingOutcome: [
      { name: 'Delivered', value: 198 },
      { name: 'Failed',    value: 16  },
    ],
    toneDistribution: [
      { name: 'Professional', value: 42 },
      { name: 'Positive',     value: 28 },
      { name: 'Neutral',      value: 18 },
      { name: 'Constructive', value: 22 },
      { name: 'Casual',       value: 18 },
    ],
  },
}
