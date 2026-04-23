import { useState, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from './icons';

/**
 * SearchBar Component - Dual Purpose
 * 1. Search existing FAQs
 * 2. If no match → trigger AI question answering
 * 
 * Props:
 * - onSearch: Called with search term
 * - onAIQuestion: Called with question text for AI
 * - onCategoryChange: Called with category
 * - isLoading: Show loading state
 */
const SearchBar = ({ onSearch, onAIQuestion, onCategoryChange, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef(null);

  const categories = ['All', 'General', 'Technical', 'Billing', 'Support', 'Features'];

  // Debounced search handler
  const handleSearchDebounced = useCallback((value) => {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onSearch(value);
      setShowSuggestions(true);
    }, 300);
  }, [onSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      handleSearchDebounced(value);
    } else {
      onSearch('');
      setShowSuggestions(false);
    }
  };

  // Send search as AI question
  const handleAskAI = () => {
    if (searchTerm.trim().length >= 5) {
      onAIQuestion(searchTerm);
      setSearchTerm('');
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    onCategoryChange(value === 'All' ? '' : value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    setShowSuggestions(false);
  };

  return (
    <div className="w-full space-y-4">
      {/* Search input with AI trigger */}
      <div className="relative flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
          <input
            type="text"
            placeholder="Search FAQs or ask AI a question..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-3 bg-white/10 border border-primary-500/30 rounded-xl 
                       text-white placeholder-white/50 focus:border-primary-500 focus:ring-2 
                       focus:ring-primary-500/50 transition-all duration-300
                       hover:border-primary-500/50 hover:bg-white/15"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="px-4 py-3 bg-white/10 border border-primary-500/30 rounded-xl text-white
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 
                     transition-all duration-300 hover:border-primary-500/50 hover:bg-white/15
                     appearance-none cursor-pointer md:w-40"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-[#1a1a2e] text-white">
              {cat}
            </option>
          ))}
        </select>

        {/* Ask AI Button */}
        {searchTerm.trim().length >= 5 && (
          <button
            onClick={handleAskAI}
            disabled={isLoading}
            className="glow-button whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '✨ Thinking...' : '✨ Ask AI'}
          </button>
        )}
      </div>

      {/* Search hint */}
      {searchTerm && (
        <p className="text-xs text-primary-400/70 px-1">
          {searchTerm.trim().length < 5
            ? `Type at least ${5 - searchTerm.trim().length} more characters to ask AI`
            : 'Search FAQs or click "Ask AI" to get an AI-powered answer'}
        </p>
      )}
    </div>
  );
};

export default SearchBar;
