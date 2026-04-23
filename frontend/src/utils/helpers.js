/**
 * Utility functions
 */

/**
 * Highlight search keyword in text
 */
export const highlightText = (text, keyword) => {
  if (!keyword) return text;

  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600/50">$1</mark>');
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Format date to readable format
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get time difference in human readable format
 */
export const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(date);
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Search FAQs with keyword matching
 */
export const searchFAQs = (faqs, keyword) => {
  if (!keyword) return faqs;

  const lowerKeyword = keyword.toLowerCase();
  return faqs.filter(
    faq =>
      faq.question.toLowerCase().includes(lowerKeyword) ||
      faq.answer.toLowerCase().includes(lowerKeyword) ||
      faq.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
};

/**
 * Filter FAQs by category
 */
export const filterByCategory = (faqs, category) => {
  if (!category || category === 'All') return faqs;
  return faqs.filter(faq => faq.category === category);
};

/**
 * Filter FAQs by tags
 */
export const filterByTags = (faqs, selectedTags) => {
  if (!selectedTags || selectedTags.length === 0) return faqs;
  return faqs.filter(faq =>
    selectedTags.some(tag => faq.tags.includes(tag))
  );
};
