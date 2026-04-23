import express from 'express';
import UserQuestion from '../models/UserQuestion.js';
import FAQ from '../models/FAQ.js';
import { rateLimitMiddleware } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/questions/ask
 * User submits a new question (with rate limiting)
 * 
 * Rate Limiting Implementation:
 * - Uses Sliding Window Algorithm (O(n) complexity)
 * - Max 5 questions per 5 minutes per user
 * - Middleware validates before reaching this handler
 */
router.post('/ask', rateLimitMiddleware, async (req, res) => {
  try {
    const { question, email, category } = req.body;
    const userIdentifier = req.userIdentifier;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validation
    if (!question || question.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Question must be at least 5 characters long',
      });
    }

    // Create new user question
    const newQuestion = new UserQuestion({
      question: question.trim(),
      userIdentifier,
      email: email || 'anonymous@example.com',
      category: category || 'General',
      ipAddress,
    });

    await newQuestion.save();

    // Try to find similar FAQs (simple keyword matching)
    const suggestedFAQs = await findSimilarFAQs(question);

    res.status(201).json({
      success: true,
      message: 'Question submitted successfully! It will be reviewed soon.',
      data: {
        questionId: newQuestion._id,
        question: newQuestion.question,
        suggestedFAQs: suggestedFAQs,
        rateLimitInfo: {
          remainingRequests: req.rateLimitInfo.remainingRequests,
          resetTime: req.rateLimitInfo.resetTime,
        },
      },
    });
  } catch (error) {
    console.error('Error submitting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting question',
      error: error.message,
    });
  }
});

/**
 * GET /api/questions
 * Fetch all user questions (Admin endpoint)
 * 
 * Query parameters:
 * - status: Filter by status (pending, reviewed, answered, archived)
 * - category: Filter by category
 */
router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const questions = await UserQuestion.find(query)
      .populate('relatedFAQId', 'question answer')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message,
    });
  }
});

/**
 * PUT /api/questions/:id
 * Update user question status and link to FAQ
 */
router.put('/:id', async (req, res) => {
  try {
    const { status, relatedFAQId } = req.body;

    const updatedQuestion = await UserQuestion.findByIdAndUpdate(
      req.params.id,
      {
        status,
        relatedFAQId: relatedFAQId || undefined,
      },
      { new: true, runValidators: true }
    ).populate('relatedFAQId', 'question answer');

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/questions/:id
 * Delete a user question
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedQuestion = await UserQuestion.findByIdAndDelete(req.params.id);

    if (!deletedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message,
    });
  }
});

/**
 * POST /api/questions/convert-to-faq/:id
 * Admin endpoint: Manually convert a frequent question to FAQ
 */
router.post('/convert-to-faq/:id', async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || answer.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Answer must be at least 10 characters long',
      });
    }

    const userQuestion = await UserQuestion.findById(req.params.id);

    if (!userQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    if (userQuestion.isConvertedToFAQ) {
      return res.status(400).json({
        success: false,
        message: 'Question already converted to FAQ',
      });
    }

    // Create FAQ from the question
    const newFAQ = new FAQ({
      question: userQuestion.question,
      answer: answer.trim(),
      category: userQuestion.category || 'General',
      tags: [userQuestion.category || 'General', 'auto-created'],
      isActive: true,
    });

    const savedFAQ = await newFAQ.save();

    // Update user question
    userQuestion.isConvertedToFAQ = true;
    userQuestion.faqId = savedFAQ._id;
    await userQuestion.save();

    console.log(`🎉 Manually converted question to FAQ. FAQ ID: ${savedFAQ._id}`);

    res.json({
      success: true,
      message: 'Question converted to FAQ successfully',
      data: {
        questionId: userQuestion._id,
        faqId: savedFAQ._id,
        question: userQuestion.question,
        answer: newFAQ.answer,
      },
    });
  } catch (error) {
    console.error('Error converting to FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting to FAQ',
      error: error.message,
    });
  }
});

/**
 * GET /api/questions/frequent/all
 * Get all questions that have been asked 2 or more times (frequently asked)
 * These questions may have been auto-converted to FAQs
 */
router.get('/frequent/all', async (req, res) => {
  try {
    const frequentQuestions = await UserQuestion.find({
      askCount: { $gte: 2 },
    })
      .populate('faqId', 'question answer category tags')
      .sort({ askCount: -1, createdAt: -1 });

    res.json({
      success: true,
      count: frequentQuestions.length,
      data: frequentQuestions.map(q => ({
        _id: q._id,
        question: q.question,
        askCount: q.askCount,
        category: q.category,
        isConvertedToFAQ: q.isConvertedToFAQ,
        createdFAQ: q.faqId,
        firstAskedAt: q.createdAt,
        lastAskedAt: q.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching frequent questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching frequent questions',
      error: error.message,
    });
  }
});

/**
 * Helper function: Find similar FAQs based on keywords
 * Simple string matching implementation
 */
async function findSimilarFAQs(question) {
  try {
    // Extract keywords (simple approach: split and filter common words)
    const keywords = question
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Search for FAQs containing any of the keywords
    const suggestedFAQs = await FAQ.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { question: { $regex: keywords.join('|'), $options: 'i' } },
            { answer: { $regex: keywords.join('|'), $options: 'i' } },
          ],
        },
      ],
    })
      .limit(3)
      .select('question answer category');

    return suggestedFAQs;
  } catch (error) {
    console.error('Error finding similar FAQs:', error);
    return [];
  }
}

export default router;
