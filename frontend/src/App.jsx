import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import VoiceAgent from './components/VoiceAgent';
import FAQAccordion from './components/FAQAccordion';
import AIResponseCard from './components/AIResponseCard';
import { faqAPI, aiAPI, reactionAPI } from './utils/api';
import { filterByCategory, filterByTags, searchFAQs } from './utils/helpers';
import './styles/globals.css';

export default function App() {
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // AI State
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [showAIResponse, setShowAIResponse] = useState(false);
  
  const aiResponseRef = useRef(null);

  // Fetch FAQs on mount
  useEffect(() => {
    fetchFAQs();
    // Force dark mode
    document.documentElement.classList.add('dark');
  }, []);

  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await faqAPI.getAll();
      setFaqs(data.data || []);
      setFilteredFaqs(data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch FAQs');
      console.error('Error fetching FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter FAQs on search/category change
  useEffect(() => {
    let results = faqs;

    // Filter by category
    if (selectedCategory) {
      results = filterByCategory(results, selectedCategory);
    }

    // Search
    if (searchTerm) {
      results = searchFAQs(results, searchTerm);
    }

    setFilteredFaqs(results);
  }, [searchTerm, selectedCategory, faqs]);

  // Handle AI Question
  const handleAIQuestion = async (question) => {
    if (question.trim().length < 5) {
      setError('Question must be at least 5 characters long');
      return;
    }

    setAiQuestion(question);
    setAiLoading(true);
    setShowAIResponse(true);
    setSearchTerm('');

    try {
      const response = await aiAPI.askAI(question);
      setAiResponse(response.response);
      
      // Scroll to AI response
      setTimeout(() => {
        aiResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } catch (err) {
      setError(err.message || 'Failed to get AI response');
      setAiResponse(null);
    } finally {
      setAiLoading(false);
    }
  };

  // Voice to AI
  const handleVoiceTranscript = (transcript) => {
    setSearchTerm(transcript);
    if (transcript.length >= 5) {
      // Auto-trigger AI after a short delay
      setTimeout(() => {
        handleAIQuestion(transcript);
      }, 500);
    }
  };

  // Handle Like
  const handleLike = async (faqId) => {
    try {
      await reactionAPI.like(faqId);
      fetchFAQs(); // Refresh
    } catch (err) {
      console.error('Error liking FAQ:', err);
    }
  };

  // Handle Dislike
  const handleDislike = async (faqId) => {
    try {
      await reactionAPI.dislike(faqId);
      fetchFAQs(); // Refresh
    } catch (err) {
      console.error('Error disliking FAQ:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <Header />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold neon-text mb-4">
            Smart FAQ Accordion
          </h1>
          <p className="text-white/70 text-lg">
            Search FAQs or ask AI anything
          </p>
        </div>

        {/* Voice Agent */}
        <div className="mb-8">
          <VoiceAgent onTranscript={handleVoiceTranscript} />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={setSearchTerm}
            onAIQuestion={handleAIQuestion}
            onCategoryChange={setSelectedCategory}
            isLoading={aiLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 animate-fade-in">
            {error}
          </div>
        )}

        {/* AI Response */}
        {showAIResponse && (
          <div ref={aiResponseRef} className="mb-8">
            <AIResponseCard
              question={aiQuestion}
              response={aiResponse}
              isLoading={aiLoading}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
              </div>
              <p className="text-white/70 mt-4">Loading FAQs...</p>
            </div>
          </div>
        )}

        {/* FAQ Accordion */}
        {!isLoading && (
          <>
            {filteredFaqs.length > 0 ? (
              <>
                <p className="text-sm text-primary-400/70 mb-4">
                  Showing {filteredFaqs.length} of {faqs.length} FAQs
                </p>
                <FAQAccordion
                  faqs={filteredFaqs}
                  onLike={handleLike}
                  onDislike={handleDislike}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/70 text-lg mb-4">
                  {searchTerm
                    ? '❌ No FAQs found. Try asking AI!'
                    : '📚 No FAQs available'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => handleAIQuestion(searchTerm)}
                    className="glow-button mt-4"
                  >
                    Ask AI Instead
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-white/40 text-sm border-t border-white/10 pt-8">
          <p>🚀 Smart FAQ Powered by AI | Dark Mode Enabled</p>
        </footer>
      </main>
    </div>
  );
}
