import { useState, useCallback, useRef } from 'react';

interface VoiceHookReturn {
  isPlaying: boolean;
  playVoice: (text: string, character: string) => Promise<void>;
  stopVoice: () => void;
}

export function useVoice(): VoiceHookReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopVoice = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playVoice = useCallback(async (text: string, character: string) => {
    try {
      // Stop any currently playing audio
      stopVoice();

      // Don't generate voice for very short text or non-speech content
      if (text.length < 10 || /^[^a-zA-Z]*$/.test(text)) {
        return;
      }

      setIsPlaying(true);

      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, character }),
      });

      if (!response.ok) {
        console.log('Voice generation failed:', response.status);
        setIsPlaying(false);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        console.log('Audio playback error');
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.log('Voice playback error:', error);
      setIsPlaying(false);
    }
  }, [stopVoice]);

  return {
    isPlaying,
    playVoice,
    stopVoice,
  };
}