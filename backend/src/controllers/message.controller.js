import { Feedback } from '../models/Feedback.js';
import { Contact } from '../models/Contact.js';
import { Message } from '../models/Message.js';
import { sendSMS } from '../services/messaging/twilio.service.js';
import { sendEmail } from '../services/messaging/email.service.js';
import { sendWhatsApp } from '../services/messaging/whatsapp.service.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

export const messageController = {
  async send(req, res, next) {
    try {
      const { feedbackId, feedbackIds, contactIds, channel, message } = req.body;
      const targetFeedbackId = feedbackId || (Array.isArray(feedbackIds) ? feedbackIds[0] : null);

      if (!targetFeedbackId && !message) {
        return sendError(res, 'Please provide an approved feedback or custom message.', 400, 'FEEDBACK_REQUIRED');
      }

      let feedbackDoc = null;
      let messageContent = message || '';

      if (targetFeedbackId) {
        feedbackDoc = await Feedback.findOne({ _id: targetFeedbackId, userId: req.user._id });
        if (!feedbackDoc) {
          return sendError(res, 'Specified feedback not found or unauthorized.', 404, 'FEEDBACK_NOT_FOUND');
        }

        if (feedbackDoc.status !== 'approved') {
          return sendError(
            res,
            'Feedback must be approved before sending.',
            400,
            'FEEDBACK_NOT_APPROVED'
          );
        }

        if (!messageContent) {
          messageContent = feedbackDoc.content;
        }
      }

      const contacts = await Contact.find({
        _id: { $in: contactIds },
        userId: req.user._id,
      });

      if (!contacts.length) {
        return sendError(res, 'No valid contacts found for current user.', 400, 'CONTACTS_NOT_FOUND');
      }

      let sentCount = 0;
      let deliveredCount = 0;
      let failedCount = 0;
      const results = [];

      for (const contact of contacts) {
        let sendResult = { success: false, status: 'failed', provider: 'unknown', error: 'Unknown error' };

        if (channel === 'sms') {
          sendResult = await sendSMS(contact.phone, messageContent);
        } else if (channel === 'email') {
          const subject = feedbackDoc?.topic ? `Feedback — ${feedbackDoc.topic}` : 'SmartFeedback AI Message';
          sendResult = await sendEmail(contact.email, subject, messageContent);
        } else if (channel === 'whatsapp') {
          sendResult = await sendWhatsApp(contact.phone, messageContent);
        } else {
          sendResult = { success: false, status: 'failed', provider: channel, error: `Unsupported channel: ${channel}` };
        }

        const isSuccess = sendResult.success;
        const status = isSuccess ? (sendResult.status || 'sent') : 'failed';

        if (isSuccess) {
          sentCount++;
          if (status === 'delivered') deliveredCount++;
        } else {
          failedCount++;
        }

        const msgDoc = await Message.create({
          userId: req.user._id,
          feedbackId: feedbackDoc ? feedbackDoc._id : null,
          contactId: contact._id,
          channel,
          message: messageContent,
          provider: sendResult.provider || 'mock',
          providerMessageId: sendResult.providerMessageId || '',
          status,
          errorMessage: sendResult.error || '',
          sentAt: isSuccess ? new Date() : null,
          deliveredAt: status === 'delivered' ? new Date() : null,
        });

        results.push({
          contactId: contact._id,
          recipient: contact.name,
          status,
          messageId: msgDoc._id,
        });
      }

      const summary = {
        total: contacts.length,
        sent: sentCount,
        delivered: deliveredCount || sentCount,
        failed: failedCount,
        results,
      };

      return sendSuccess(
        res,
        summary,
        'Messages dispatched successfully',
        200,
        {
          sent: sentCount,
          delivered: deliveredCount || sentCount,
          failed: failedCount,
          total: contacts.length,
        }
      );
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req, res, next) {
    try {
      const {
        page = 1,
        limit = 50,
        channel,
        status,
        feedbackId,
        sortBy = 'createdAt',
        order = 'desc',
      } = req.query;

      const filter = { userId: req.user._id };

      if (channel) filter.channel = channel;
      if (status) filter.status = status;
      if (feedbackId) filter.feedbackId = feedbackId;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const skip = (pageNum - 1) * limitNum;

      const [messages, total] = await Promise.all([
        Message.find(filter)
          .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
          .skip(skip)
          .limit(limitNum)
          .populate('contactId', 'name email phone tags')
          .populate('feedbackId', 'topic content tone'),
        Message.countDocuments(filter),
      ]);

      const formatted = messages.map((m) => ({
        id: m._id.toString(),
        _id: m._id,
        date: m.createdAt,
        createdAt: m.createdAt,
        channel: m.channel,
        status: m.status === 'delivered' ? 'Completed' : (m.status === 'sent' ? 'Sent' : 'Failed'),
        rawStatus: m.status,
        feedback: m.feedbackId?.topic || 'Custom Feedback',
        feedbackContent: m.feedbackId?.content || m.message,
        recipient: m.contactId?.name || 'Contact',
        recipientContact: m.contactId?.email || m.contactId?.phone || '',
        message: m.message,
        provider: m.provider,
        providerMessageId: m.providerMessageId,
        errorMessage: m.errorMessage,
      }));

      return sendPaginated(res, formatted, {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      }, 'Message history retrieved');
    } catch (error) {
      next(error);
    }
  },

  async getHistoryItem(req, res, next) {
    try {
      const message = await Message.findOne({ _id: req.params.id, userId: req.user._id })
        .populate('contactId', 'name email phone tags')
        .populate('feedbackId', 'topic content tone');

      if (!message) {
        return sendError(res, 'Message history entry not found', 404, 'NOT_FOUND');
      }

      return sendSuccess(res, {
        id: message._id.toString(),
        _id: message._id,
        date: message.createdAt,
        createdAt: message.createdAt,
        channel: message.channel,
        status: message.status === 'delivered' ? 'Completed' : (message.status === 'sent' ? 'Sent' : 'Failed'),
        rawStatus: message.status,
        feedback: message.feedbackId?.topic || 'Custom Feedback',
        recipient: message.contactId?.name || 'Contact',
        contact: message.contactId,
        feedbackDetail: message.feedbackId,
        message: message.message,
        provider: message.provider,
        providerMessageId: message.providerMessageId,
        errorMessage: message.errorMessage,
        sentAt: message.sentAt,
        deliveredAt: message.deliveredAt,
      });
    } catch (error) {
      next(error);
    }
  },
};
