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
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      stop();
    };
  }, []);

  const speak = (text: string, options: SpeechOptions = {}) => {
    if (!('speechSynthesis' in window) || !enabled || !text.trim()) {
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

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
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