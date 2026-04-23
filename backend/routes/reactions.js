import express from 'express';
import FAQ from '../models/FAQ.js';

const router = express.Router();

/**
 * POST /api/reactions/like/:faqId
 * Add/remove like reaction to an FAQ
 * Stores user IP to prevent duplicate likes
 */
router.post('/like/:faqId', async (req, res) => {
  try {
    const { faqId } = req.params;
    const userIdentifier = req.ip || req.connection.remoteAddress;

    const faq = await FAQ.findById(faqId);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    // Check if user already liked
    const hasLiked = faq.userLikes.includes(userIdentifier);
    const hasDisliked = faq.userDislikes.includes(userIdentifier);

    if (hasLiked) {
      // Remove like
      faq.likes -= 1;
      faq.userLikes = faq.userLikes.filter(id => id !== userIdentifier);
    } else {
      // Add like
      faq.likes += 1;
      faq.userLikes.push(userIdentifier);

      // Remove dislike if exists
      if (hasDisliked) {
        faq.dislikes -= 1;
        faq.userDislikes = faq.userDislikes.filter(id => id !== userIdentifier);
      }
    }

    await faq.save();

    res.json({
      success: true,
      message: hasLiked ? 'Like removed' : 'FAQ liked successfully',
      data: {
        likes: faq.likes,
        dislikes: faq.dislikes,
        userLiked: !hasLiked,
      },
    });
  } catch (error) {
    console.error('Error liking FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing like',
      error: error.message,
    });
  }
});

/**
 * POST /api/reactions/dislike/:faqId
 * Add/remove dislike reaction to an FAQ
 */
router.post('/dislike/:faqId', async (req, res) => {
  try {
    const { faqId } = req.params;
    const userIdentifier = req.ip || req.connection.remoteAddress;

    const faq = await FAQ.findById(faqId);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found',
      });
    }

    // Check if user already disliked
    const hasDisliked = faq.userDislikes.includes(userIdentifier);
    const hasLiked = faq.userLikes.includes(userIdentifier);

    if (hasDisliked) {
      // Remove dislike
      faq.dislikes -= 1;
      faq.userDislikes = faq.userDislikes.filter(id => id !== userIdentifier);
    } else {
      // Add dislike
      faq.dislikes += 1;
      faq.userDislikes.push(userIdentifier);

      // Remove like if exists
      if (hasLiked) {
        faq.likes -= 1;
        faq.userLikes = faq.userLikes.filter(id => id !== userIdentifier);
      }
    }

    await faq.save();

    res.json({
      success: true,
      message: hasDisliked ? 'Dislike removed' : 'FAQ disliked',
      data: {
        likes: faq.likes,
        dislikes: faq.dislikes,
        userDisliked: !hasDisliked,
      },
    });
  } catch (error) {
    console.error('Error disliking FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing dislike',
      error: error.message,
    });
  }
});

export default router;
