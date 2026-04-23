import express from 'express';
import FAQ from '../models/FAQ.js';

const router = express.Router();

/**
 * GET /api/faqs
 * Fetch all FAQs with optional filtering
 * 
 * Query parameters:
 * - category: Filter by category
 * - tags: Filter by tags (comma-separated)
 * - search: Search in question and answer
 * - sortBy: Sort by 'likes', 'views', 'recent'
 */
router.get('/', async (req, res) => {
  try {
    const { category, tags, search, sortBy = 'recent' } = req.query;

    let query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tags (at least one tag should match)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    let sortObj = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'likes') {
      sortObj = { likes: -1 };
    } else if (sortBy === 'views') {
      sortObj = { views: -1 };
    } else if (sortBy === 'popular') {
      sortObj = { likes: -1, views: -1 };
    }

    const faqs = await FAQ.find(query).sort(sortObj);

    // Increment view count
    await FAQ.updateMany({ _id: { $in: faqs.map(faq => faq._id) } }, { $inc: { views: 1 } }, { multi: true });

    res.json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQs',
      error: error.message,
    });
  }
});

/**
 * GET /api/faqs/:id
 * Fetch single FAQ by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    res.json({
      success: true,
      data: faq,
    });
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
      error: error.message,
    });
  }
});

/**
 * POST /api/faqs
 * Create new FAQ (Admin only)
 */
router.post('/', async (req, res) => {
  try {
    const { question, answer, category, tags } = req.body;

    // Validation
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required',
      });
    }

    const newFaq = new FAQ({
      question,
      answer,
      category: category || 'General',
      tags: tags || [],
    });

    await newFaq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: newFaq,
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating FAQ',
      error: error.message,
    });
  }
});

/**
 * PUT /api/faqs/:id
 * Update FAQ (Admin only)
 */
router.put('/:id', async (req, res) => {
  try {
    const { question, answer, category, tags, isActive } = req.body;

    const updatedFaq = await FAQ.findByIdAndUpdate(
      req.params.id,
      {
        question,
        answer,
        category,
        tags,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!updatedFaq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: updatedFaq,
    });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating FAQ',
      error: error.message,
    });
  }
});

/**
 * DELETE /api/faqs/:id
 * Delete FAQ (Admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedFaq = await FAQ.findByIdAndDelete(req.params.id);

    if (!deletedFaq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    res.json({
      success: true,
      message: 'FAQ deleted successfully',
      data: deletedFaq,
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting FAQ',
      error: error.message,
    });
  }
});

export default router;
