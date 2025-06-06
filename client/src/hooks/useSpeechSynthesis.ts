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
    
    // Configure voice settings for dramatic storytelling
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 0.8;
    utterance.volume = options.volume || 0.8;

    // Find a suitable voice
    if (voices.length > 0) {
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en')
      ) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => {
      console.log('Speech started');
      setSpeaking(true);
    };
    utterance.onend = () => {
      console.log('Speech ended');
      setSpeaking(false);
    };
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      setSpeaking(false);
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