import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true,
      index: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['sms', 'email', 'whatsapp'],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: 'mock',
    },
    providerMessageId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'sent', 'delivered', 'failed'],
      default: 'queued',
      index: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    sentAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

export const Message = mongoose.model('Message', messageSchema);
