import { useState, useEffect } from 'react';
import { ChevronDownIcon } from './icons';

/**
 * FAQAccordion Component
 * Displays FAQs in expandable accordion format
 * 
 * Props:
 * - faqs: Array of FAQ objects
 * - allowMultiple: Boolean to allow multiple open items
 * - onLike: Callback for like action
 * - onDislike: Callback for dislike action
 */
const FAQAccordion = ({ faqs, allowMultiple = true, onLike, onDislike }) => {
  const [openItems, setOpenItems] = useState(new Set());

  const handleAccordionClick = (id) => {
    const newOpenItems = new Set(openItems);

    if (newOpenItems.has(id)) {
      // Close if already open
      newOpenItems.delete(id);
    } else {
      // Open
      if (!allowMultiple) {
        newOpenItems.clear(); // Close all others if single mode
      }
      newOpenItems.add(id);
    }

    setOpenItems(newOpenItems);
  };

  return (
    <div className="space-y-4">
      {faqs.map(faq => (
        <AccordionItem
          key={faq._id}
          faq={faq}
          isOpen={openItems.has(faq._id)}
          onClick={() => handleAccordionClick(faq._id)}
          onLike={onLike}
          onDislike={onDislike}
        />
      ))}
    </div>
  );
};

/**
 * AccordionItem Component
 * Individual accordion item with smooth animation
 */
const AccordionItem = ({ faq, isOpen, onClick, onLike, onDislike }) => {
  const [userReaction, setUserReaction] = useState(null);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await onLike(faq._id);
      setUserReaction('like');
      setTimeout(() => setUserReaction(null), 2000);
    } catch (error) {
      console.error('Error liking FAQ:', error);
    }
  };

  const handleDislike = async (e) => {
    e.stopPropagation();
    try {
      await onDislike(faq._id);
      setUserReaction('dislike');
      setTimeout(() => setUserReaction(null), 2000);
    } catch (error) {
      console.error('Error disliking FAQ:', error);
    }
  };

  return (
    <div className="group">
      <button
        onClick={onClick}
        className="w-full text-left glassmorphism rounded-xl p-4 md:p-6 hover:shadow-lg dark:hover:shadow-blue-500/20 hover:shadow-blue-400/20 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {faq.question}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {faq.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <ChevronDownIcon
            className={`w-5 h-5 flex-shrink-0 text-slate-600 dark:text-slate-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expandable content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="p-4 md:p-6 bg-white/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base mb-4">
            {faq.answer}
          </p>

          {/* Category and reactions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">
                {faq.category}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                👁️ {faq.views} views
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Like button */}
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all duration-300 ${
                  userReaction === 'like'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                }`}
              >
                <span>👍</span>
                <span className="text-sm font-medium">{faq.likes}</span>
              </button>

              {/* Dislike button */}
              <button
                onClick={handleDislike}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all duration-300 ${
                  userReaction === 'dislike'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                }`}
              >
                <span>👎</span>
                <span className="text-sm font-medium">{faq.dislikes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;
