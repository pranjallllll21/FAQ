import { useState, useEffect, useRef } from 'react';
import { voiceAPI } from '../utils/voice';

/**
 * VoiceAgent Component
 * Integrates Web Speech API for voice-to-text and AI suggestions
 * 
 * Props:
 * - onTranscript: Callback when speech is recognized
 * - onSuggestionsGet: Callback with suggested FAQs
 */
const VoiceAgent = ({ onTranscript, onSuggestionsGet }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, listening, processing, done
  const recognitionRef = useRef(null);

  // Check browser support on mount
  useEffect(() => {
    if (!voiceAPI.isSupported()) {
      setError('Web Speech API not supported in your browser');
    }
  }, []);

  const startListening = () => {
    setError(null);
    setTranscript('');
    setInterim('');
    setIsListening(true);
    setStatus('listening');

    recognitionRef.current = voiceAPI.startListening(
      (result) => {
        // Update transcript as user speaks
        setInterim(result.transcript);

        // When speech is final, process it
        if (result.isFinal) {
          setTranscript(result.transcript);
          setInterim('');
          setStatus('processing');
          setIsListening(false);
          onTranscript(result.transcript);
        }
      },
      (error) => {
        setError(`Voice error: ${error}`);
        setStatus('idle');
        setIsListening(false);
      },
      () => {
        setStatus('done');
        setIsListening(false);
        setTimeout(() => {
          if (transcript) {
            // After done, reset after delay
            setStatus('idle');
          }
        }, 2000);
      }
    );
  };

  const stopListening = () => {
    voiceAPI.stopListening(recognitionRef.current);
    setStatus('idle');
    setIsListening(false);
    setInterim('');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Microphone Button */}
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={error !== null || status === 'processing'}
        className={`
          relative w-16 h-16 rounded-full font-semibold transition-all duration-300 flex items-center justify-center
          ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse'
              : status === 'processing'
              ? 'bg-blue-500 opacity-60'
              : status === 'done'
              ? 'bg-green-500'
              : 'bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/50'
          }
          text-white text-2xl
          ${error ? 'bg-red-600 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        🎤
      </button>

      {/* Status text */}
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
        {status === 'listening' && 'Listening... Speak now!'}
        {status === 'processing' && 'Processing...'}
        {status === 'done' && 'Done!'}
        {status === 'idle' && 'Click to start'}
      </p>

      {/* Transcript display */}
      {(transcript || interim) && (
        <div className="glassmorphism rounded-lg p-4 max-w-md w-full animate-fade-in">
          {interim && (
            <p className="text-slate-600 dark:text-slate-400 italic text-sm mb-2">
              {interim}
            </p>
          )}
          {transcript && (
            <p className="text-slate-900 dark:text-white font-medium">
              Your question: <span className="text-primary-600 dark:text-primary-400">{transcript}</span>
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="glassmorphism rounded-lg p-4 max-w-md w-full bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Browser support message */}
      {!voiceAPI.isSupported() && (
        <div className="glassmorphism rounded-lg p-4 max-w-md w-full bg-yellow-50/50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
            💡 Web Speech API not supported. Please use Chrome, Edge, or Safari.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;
