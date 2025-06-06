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
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      stop();
    };
  }, []);

  const speak = (text: string, options: SpeechOptions = {}) => {
    if (!enabled || !text.trim() || !userInteracted) {
      console.log('Speech blocked:', { enabled, hasText: !!text.trim(), userInteracted });
      return;
    }

    // Stop any current speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings for dramatic storytelling
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 0.8;
    utterance.volume = options.volume || 0.8;

    // Prefer a dramatic/deep voice if available
    const preferredVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('male') ||
      voice.name.toLowerCase().includes('deep') ||
      voice.name.toLowerCase().includes('daniel') ||
      voice.name.toLowerCase().includes('alex')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      console.log('Speech synthesis started');
      setSpeaking(true);
    };
    utterance.onend = () => {
      console.log('Speech synthesis ended');
      setSpeaking(false);
    };
    utterance.onerror = (event) => {
      console.log('Speech synthesis error:', event);
      setSpeaking(false);
    };

    utteranceRef.current = utterance;
    console.log('Attempting to speak with user interaction:', text.substring(0, 50));
    speechSynthesis.speak(utterance);
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