import mongoose from 'mongoose';

/**
 * FAQ Schema
 * Stores frequently asked questions with metadata
 */
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    category: {
      type: String,
      enum: ['General', 'Technical', 'Billing', 'Support', 'Features'],
      default: 'General',
    },
    tags: {
      type: [String],
      default: [],
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    userLikes: {
      type: [String], // Store user IPs or IDs who liked
      default: [],
    },
    userDislikes: {
      type: [String], // Store user IPs or IDs who disliked
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for search functionality
faqSchema.index({ question: 'text', answer: 'text', tags: 'text' });

export default mongoose.model('FAQ', faqSchema);
