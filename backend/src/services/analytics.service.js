import { Feedback } from '../models/Feedback.js';
import { Contact } from '../models/Contact.js';
import { Message } from '../models/Message.js';
import { Generation } from '../models/Generation.js';

export const analyticsService = {
  async getSummary(userId) {
    const [totalFeedback, activeContacts, totalMessages, successfulDeliveries, failedMessages] =
      await Promise.all([
        Feedback.countDocuments({ userId }),
        Contact.countDocuments({ userId, isActive: true }),
        Message.countDocuments({ userId }),
        Message.countDocuments({ userId, status: { $in: ['sent', 'delivered'] } }),
        Message.countDocuments({ userId, status: 'failed' }),
      ]);

    const successRate = totalMessages > 0
      ? Number(((successfulDeliveries / totalMessages) * 100).toFixed(1))
      : 100.0;

    return {
      feedbackGenerated: totalFeedback,
      contacts: activeContacts,
      messagesSent: totalMessages,
      successfulMessages: successfulDeliveries,
      failedMessages,
      successRate,
      totalFeedbackGenerated: totalFeedback,
      totalMessagesSent: totalMessages,
      successfulDeliveries,
      activeContacts,
    };
  },

  async getCharts(userId) {
    const channelCounts = await Message.aggregate([
      { $match: { userId } },
      { $group: { _id: '$channel', count: { $sum: 1 } } },
    ]);

    const channelDistribution = [
      { name: 'SMS', value: channelCounts.find((c) => c._id === 'sms')?.count || 0 },
      { name: 'Email', value: channelCounts.find((c) => c._id === 'email')?.count || 0 },
      { name: 'WhatsApp', value: channelCounts.find((c) => c._id === 'whatsapp')?.count || 0 },
    ];

    const successful = await Message.countDocuments({ userId, status: { $in: ['sent', 'delivered'] } });
    const failed = await Message.countDocuments({ userId, status: 'failed' });
    const sendingOutcome = [
      { name: 'Delivered', value: successful },
      { name: 'Failed', value: failed },
    ];

    const toneCounts = await Feedback.aggregate([
      { $match: { userId } },
      { $group: { _id: '$tone', count: { $sum: 1 } } },
    ]);

    const toneDistribution = toneCounts.map((t) => ({
      name: t._id || 'Professional',
      value: t.count,
    }));

    if (toneDistribution.length === 0) {
      toneDistribution.push({ name: 'Professional', value: 0 });
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const feedbackOverTime = [];
    const messagesOverTime = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = months[d.getMonth()];

      const [fbCount, msgSent, msgDelivered] = await Promise.all([
        Feedback.countDocuments({ userId, createdAt: { $gte: d, $lt: nextD } }),
        Message.countDocuments({ userId, createdAt: { $gte: d, $lt: nextD } }),
        Message.countDocuments({ userId, status: { $in: ['sent', 'delivered'] }, createdAt: { $gte: d, $lt: nextD } }),
      ]);

      feedbackOverTime.push({ month: monthName, count: fbCount });
      messagesOverTime.push({ month: monthName, sent: msgSent, delivered: msgDelivered });
    }

    return {
      feedbackOverTime,
      messagesOverTime,
      channelDistribution,
      sendingOutcome,
      toneDistribution,
    };
  },

  async getDashboard(userId) {
    const [summary, charts, recentMessages, recentGenerations] = await Promise.all([
      this.getSummary(userId),
      this.getCharts(userId),
      Message.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('contactId', 'name email phone')
        .populate('feedbackId', 'topic content'),
      Generation.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      stats: summary,
      summary,
      charts,
      recentActivity: recentMessages.map((m) => ({
        id: m._id,
        type: 'message',
        channel: m.channel,
        status: m.status,
        recipient: m.contactId?.name || 'Unknown Contact',
        topic: m.feedbackId?.topic || 'Feedback',
        date: m.createdAt,
      })),
      recentGenerations,
      generationTrend: charts.feedbackOverTime,
      messageTrend: charts.messagesOverTime,
      channelDistribution: charts.channelDistribution,
    };
  },
};
