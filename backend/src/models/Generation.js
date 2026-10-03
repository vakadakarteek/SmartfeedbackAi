import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    feedbackCount: {
      type: Number,
      default: 5,
    },
    tone: {
      type: String,
      default: 'Professional',
    },
    length: {
      type: String,
      default: 'medium',
    },
    language: {
      type: String,
      default: 'English',
    },
    style: {
      type: String,
      default: 'balanced',
    },
    keywords: [{
      type: String,
      trim: true,
    }],
    avoidTopics: [{
      type: String,
      trim: true,
    }],
    audience: {
      type: String,
      default: 'general',
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    model: {
      type: String,
      default: 'gemini-1.5-flash',
    },
    generationDuration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

generationSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

export const Generation = mongoose.model('Generation', generationSchema);
