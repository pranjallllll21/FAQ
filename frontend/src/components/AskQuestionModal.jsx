import { useState } from 'react';
import { questionAPI } from '../utils/api';

/**
 * RateLimitModal Component
 * Shows when user exceeds rate limit (5 questions per 5 minutes)
 */
const RateLimitModal = ({ message, resetSeconds, onDismiss }) => {
  const [remainingTime, setRemaining] = useState(resetSeconds);

  // Countdown timer
  useState(() => {
    if (remainingTime <= 0) return;
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime, onDismiss]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="glassmorphism rounded-2xl p-8 max-w-md w-full mx-4 animate-slide-down shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Rate Limit Exceeded
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            You've asked too many questions. Please wait before asking more.
          </p>

          {/* Countdown timer */}
          <div className="mb-6">
            <div className="text-4xl font-bold text-red-500 font-mono">
              {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Try again in {remainingTime} seconds
            </p>
          </div>

          {/* Info box */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              📋 You can ask up to <strong>5 questions per 5 minutes</strong>
            </p>
          </div>

          <button
            onClick={onDismiss}
            className="w-full px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * AskQuestionModal Component
 * Form for users to submit new questions
 */
const AskQuestionModal = ({ isOpen, onClose, onSuggestionsFound }) => {
  const [formData, setFormData] = useState({
    question: '',
    email: '',
    category: 'General',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setRateLimitError(null);

    try {
      const response = await questionAPI.ask(formData);

      // Check for rate limiting
      if (response.success) {
        setSuccess(true);
        if (response.data.suggestedFAQs) {
          onSuggestionsFound(response.data.suggestedFAQs);
        }
        setRemainingRequests(response.data.rateLimitInfo?.remainingRequests);

        // Reset form
        setFormData({ question: '', email: '', category: 'General' });

        // Close after success
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      }
    } catch (error) {
      // Check if it's a rate limit error (429 status)
      if (error.message.includes('429') || error.resetTimeSeconds) {
        setRateLimitError({
          message: error.message,
          resetTimeSeconds: error.resetTimeSeconds || 300,
        });
      } else {
        setRateLimitError({
          message: error.message || 'Failed to submit question',
          resetTimeSeconds: null,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show rate limit modal if error
  if (rateLimitError && rateLimitError.resetTimeSeconds) {
    return (
      <RateLimitModal
        message={rateLimitError.message}
        resetSeconds={rateLimitError.resetTimeSeconds}
        onDismiss={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="glassmorphism rounded-2xl p-6 md:p-8 max-w-md w-full mx-4 animate-slide-down shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Ask a Question
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-8 animate-fade-in">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
              Question Submitted!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Thanks! We'll review your question and respond soon.
            </p>
            {remainingRequests !== null && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Remaining questions: <span className="font-bold text-primary-600">{remainingRequests}</span> / 5
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Question input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your Question *
              </label>
              <textarea
                name="question"
                value={formData.question}
                onChange={handleChange}
                required
                minLength={5}
                maxLength={500}
                rows={4}
                placeholder="What would you like to know?"
                className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Characters: {formData.question.length} / 500
              </p>
            </div>

            {/* Email input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option>General</option>
                <option>Technical</option>
                <option>Billing</option>
                <option>Support</option>
                <option>Features</option>
              </select>
            </div>

            {/* Error message */}
            {rateLimitError && (
              <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  ⚠️ {rateLimitError.message}
                </p>
              </div>
            )}

            {/* Remaining requests info */}
            {remainingRequests !== null && !rateLimitError && (
              <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  📊 Remaining questions: <span className="font-bold">{remainingRequests}</span> / 5 (resets in 5 min)
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || formData.question.length < 5}
              className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Submitting...' : 'Submit Question'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export { AskQuestionModal, RateLimitModal };
export default AskQuestionModal;
