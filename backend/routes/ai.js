/**
 * Groq Integration Routes
 * Handles AI-powered question answering using Groq API
 */

import express from 'express';
import Groq from 'groq-sdk';
import UserQuestion from '../models/UserQuestion.js';
import FAQ from '../models/FAQ.js';
import { rateLimitMiddleware } from '../middleware/rateLimiter.js';

const router = express.Router();

const GROQ_MODEL_CANDIDATES = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'gemma2-9b-it',
];

/**
 * POST /ask-ai
 * Send a question to Groq and get an AI-generated response
 */
router.post('/ask-ai', rateLimitMiddleware, async (req, res) => {
  try {
    const { question } = req.body;

    // Validate input
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required', success: false });
    }

    if (question.length < 5) {
      return res.status(400).json({ error: 'Question must be at least 5 characters long', success: false });
    }

    console.log(`📝 Processing AI question: "${question}"`);

    // Get API key
    const apiKey = (process.env.GROQ_API_KEY || '').trim();
    if (!apiKey) {
      console.error('❌ Groq API key not configured');
      return res.status(500).json({ 
        error: 'AI service not available. Please configure Groq API key.', 
        success: false 
      });
    }

    // Initialize Groq
    const groq = new Groq({ apiKey });

    console.log('🔄 Calling Groq API...');

    let completion = null;
    let modelUsed = '';
    let lastModelError = null;

    for (const modelName of GROQ_MODEL_CANDIDATES) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful FAQ assistant. Answer clearly and concisely.',
            },
            {
              role: 'user',
              content: question,
            },
          ],
          model: modelName,
          max_tokens: 256,
          temperature: 0.7,
        });

        modelUsed = modelName;
        console.log(`✅ Groq model success: ${modelName}`);
        break;
      } catch (modelErr) {
        lastModelError = modelErr;
        const modelErrMessage = modelErr?.message || '';

        if (modelErrMessage.includes('model_not_found') || modelErrMessage.includes('decommissioned')) {
          console.log(`⚠️ Groq model unavailable: ${modelName}`);
          continue;
        }

        throw modelErr;
      }
    }

    if (!completion) {
      throw lastModelError || new Error('No supported Groq model available for this API key.');
    }

    // Extract response
    let aiResponse = '';
    if (completion.choices && completion.choices.length > 0) {
      aiResponse = completion.choices[0].message?.content || 'Unable to generate response';
    } else {
      aiResponse = 'Unable to generate response';
    }

    console.log(`✅ AI Response generated`);

    // Track question in database (best-effort)
    try {
      const normalizedQuestion = question.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[?!.;:,]+$/g, '');
      
      let userQuestion = await UserQuestion.findOne({
        question: new RegExp(`^${normalizedQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      });

      if (userQuestion) {
        userQuestion.askCount = (userQuestion.askCount || 0) + 1;
        await userQuestion.save();
        console.log(`📊 Question "${question}" - Ask count: ${userQuestion.askCount}`);
      } else {
        const newUserQuestion = new UserQuestion({
          question: normalizedQuestion,
          userIdentifier: req.userIdentifier || req.ip || req.connection?.remoteAddress || 'ai-ask',
          ipAddress: req.ip || req.connection?.remoteAddress || '0.0.0.0',
          askCount: 1,
        });
        userQuestion = await newUserQuestion.save();
        console.log('📝 New question tracked in database');
      }

      // Auto-convert frequent AI questions into FAQ entries.
      if (userQuestion.askCount >= 2 && !userQuestion.isConvertedToFAQ) {
        let existingFAQ = await FAQ.findOne({
          question: new RegExp(`^${normalizedQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        });

        if (!existingFAQ) {
          existingFAQ = await FAQ.create({
            question: normalizedQuestion.charAt(0).toUpperCase() + normalizedQuestion.slice(1),
            answer: aiResponse,
            category: userQuestion.category || 'General',
            tags: [userQuestion.category || 'General', 'auto-created', 'ai-generated'],
            isActive: true,
          });
          console.log(`🎉 Auto-converted to FAQ: ${existingFAQ._id}`);
        }

        userQuestion.isConvertedToFAQ = true;
        userQuestion.faqId = existingFAQ._id;
        await userQuestion.save();
      }
    } catch (dbErr) {
      console.log('⚠️ Database tracking failed (non-critical):', dbErr?.message);
    }

    return res.status(200).json({
      success: true,
      question,
      response: aiResponse,
      timestamp: new Date(),
      model: modelUsed,
      rateLimitInfo: req.rateLimitInfo
        ? {
            remainingRequests: req.rateLimitInfo.remainingRequests,
            resetTime: req.rateLimitInfo.resetTime,
          }
        : undefined,
    });

  } catch (error) {
    console.error('❌ Error in /ask-ai:', error?.message || error);

    // Return graceful error response
    const errorMessage = error?.message || 'Unknown error';
    
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.', 
        success: false 
      });
    }

    if (errorMessage.includes('API key') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return res.status(500).json({ 
        error: 'API key configuration issue. Please check your Groq API key.', 
        success: false 
      });
    }

    if (errorMessage.includes('model_not_found') || errorMessage.includes('decommissioned')) {
      return res.status(503).json({
        error: 'Groq model unavailable right now. Please try again shortly.',
        success: false,
      });
    }

    // Generic error response
    return res.status(500).json({ 
      error: 'An error occurred while processing your question. Please try again.', 
      success: false,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    });
  }
});

export default router;
