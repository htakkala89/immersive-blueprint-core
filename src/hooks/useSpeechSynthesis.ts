import { useEffect, useRef, useState } from 'react';

interface SpeechOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    const handleUserInteraction = () => {
      setUserInteracted(true);
      // Initialize speech synthesis with a silent utterance
      if (!userInteracted && 'speechSynthesis' in window) {
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        speechSynthesis.speak(silentUtterance);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    // Listen for user interactions to enable speech synthesis
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      stop();
    };
  }, [userInteracted]);

  const speak = (text: string, options: SpeechOptions = {}) => {
    if (!('speechSynthesis' in window) || !enabled || !text.trim() || !userInteracted) {
      console.log('Speech synthesis blocked:', { 
        supported: 'speechSynthesis' in window, 
        enabled, 
        hasText: !!text.trim(), 
        userInteracted 
      });
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings for magical narrator
    utterance.rate = options.rate || 0.7; // Slow, enchanting pace
    utterance.pitch = options.pitch || 0.8; // Slightly higher for magical quality
    utterance.volume = options.volume || 0.9;

    // Find a suitable voice for magical narrator
    if (voices.length > 0) {
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('zira') ||
         voice.name.toLowerCase().includes('hazel') ||
         voice.name.toLowerCase().includes('karen'))
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => {
      console.log('Speech started');
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
      setSpeaking(true);
    };
    utterance.onend = () => {
      console.log('Speech ended');
      // Add a small delay to prevent flickering
      speakingTimeoutRef.current = setTimeout(() => {
        setSpeaking(false);
      }, 100);
    };
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      // Add a small delay to prevent flickering
      speakingTimeoutRef.current = setTimeout(() => {
        setSpeaking(false);
      }, 100);
    };

    utteranceRef.current = utterance;
    
    try {
      speechSynthesis.speak(utterance);
      console.log('Speech synthesis initiated');
    } catch (error) {
      console.error('Failed to speak:', error);
      setSpeaking(false);
    }
  };

  const stop = () => {
    speechSynthesis.cancel();
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
    }
    setSpeaking(false);
    utteranceRef.current = null;
  };

  const toggle = () => {
    setEnabled(!enabled);
    if (speaking) {
      stop();
    }
  };

  return {
    speak,
    stop,
    toggle,
    speaking,
    enabled,
    voices,
    supported: 'speechSynthesis' in window
  };
}