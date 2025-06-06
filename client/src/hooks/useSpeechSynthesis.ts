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
  const [enabled, setEnabled] = useState(false);
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
    if (!enabled || !text.trim()) return;

    // Stop any current speech
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings for dramatic storytelling
    utterance.rate = options.rate || 0.9; // Slightly slower for dramatic effect
    utterance.pitch = options.pitch || 0.8; // Lower pitch for mysterious tone
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