import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    generationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Generation',
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      default: 'General',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
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
    status: {
      type: String,
      enum: ['generated', 'edited', 'approved', 'archived'],
      default: 'generated',
      index: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  obj.text = obj.content;
  obj.edited = obj.isEdited;
  return obj;
};

export const Feedback = mongoose.model('Feedback', feedbackSchema);
