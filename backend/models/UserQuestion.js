import mongoose from 'mongoose';

/**
 * UserQuestion Schema
 * Stores user-submitted questions for admin review
 */
const userQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    userIdentifier: {
      type: String,
      required: true, // Can be IP, session ID, or user ID
    },
    email: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['General', 'Technical', 'Billing', 'Support', 'Features'],
      default: 'General',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'answered', 'archived'],
      default: 'pending',
    },
    relatedFAQId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FAQ',
      default: null,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    askCount: {
      type: Number,
      default: 1, // Increment each time question is asked via AI
    },
    isConvertedToFAQ: {
      type: Boolean,
      default: false, // Marks if question has been converted to FAQ after 3 asks
    },
    faqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FAQ',
      default: null, // Link to auto-created FAQ
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('UserQuestion', userQuestionSchema);
