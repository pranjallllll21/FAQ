/**
 * Web Speech API utilities
 * Handle speech recognition and text-to-speech
 */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const voiceAPI = {
  /**
   * Check if browser supports Web Speech API
   */
  isSupported: () => {
    return SpeechRecognition !== undefined;
  },

  /**
   * Start speech recognition
   * Returns: { transcript, isFinal }
   */
  startListening: (onResult, onError, onEnd) => {
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();

    // Configuration
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Event listeners
    recognition.onstart = () => {
      console.log('Voice recognition started...');
    };

    recognition.onresult = (event) => {
      let interim_transcript = '';
      let final_transcript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final_transcript += transcript;
        } else {
          interim_transcript += transcript;
        }
      }

      onResult({
        transcript: final_transcript || interim_transcript,
        isFinal: final_transcript.length > 0,
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition error:', event.error);
      onError(event.error);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      onEnd();
    };

    recognition.start();
    return recognition;
  },

  /**
   * Stop speech recognition
   */
  stopListening: (recognition) => {
    if (recognition) {
      recognition.stop();
    }
  },

  /**
   * Text-to-speech
   */
  speak: (text, rate = 1, pitch = 1) => {
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-Speech not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = 'en-US';

    window.speechSynthesis.speak(utterance);
  },
};

export default voiceAPI;
