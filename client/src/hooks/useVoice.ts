import { useState, useCallback, useRef } from 'react';

interface VoiceQueueItem {
  text: string;
  character: string;
  priority: number; // 1 = highest (Game Master), 2 = medium (Cha Hae-In), 3 = lowest (others)
}

interface VoiceHookReturn {
  isPlaying: boolean;
  playVoice: (text: string, character: string) => Promise<void>;
  stopVoice: () => void;
}

export function useVoice(): VoiceHookReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<VoiceQueueItem[]>([]);
  const processingRef = useRef(false);

  const stopVoice = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    queueRef.current = [];
    processingRef.current = false;
  }, []);

  const getPriority = (character: string): number => {
    if (character === 'narrator' || character === 'story-narrator') return 0; // Highest priority for narrator
    if (character === 'game-master' || character === 'system') return 1; // High priority
    if (character === 'cha-hae-in') return 2; // Medium priority
    return 3; // Lowest priority
  };

  const playVoiceImmediate = async (text: string, character: string): Promise<void> => {
    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, character }),
      });

      if (!response.ok) {
        console.log('Voice generation failed:', response.status);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      return new Promise<void>((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          resolve();
        };

        audio.onerror = () => {
          console.log('Audio playback error');
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          resolve();
        };

        audio.play().catch(() => {
          console.log('Audio play failed');
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          resolve();
        });
      });
    } catch (error) {
      console.log('Voice playback error:', error);
    }
  };

  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) {
      return;
    }

    processingRef.current = true;
    setIsPlaying(true);

    // Sort queue by priority (lower number = higher priority)
    queueRef.current.sort((a, b) => a.priority - b.priority);
    
    const nextItem = queueRef.current.shift();
    if (!nextItem) {
      processingRef.current = false;
      setIsPlaying(false);
      return;
    }

    try {
      await playVoiceImmediate(nextItem.text, nextItem.character);
    } catch (error) {
      console.error('Voice playback error:', error);
    }

    processingRef.current = false;
    setIsPlaying(false);
    
    // Process next item in queue after a short delay
    setTimeout(() => processQueue(), 500);
  }, []);

  const playVoice = useCallback(async (text: string, character: string) => {
    // Don't generate voice for very short text or non-speech content
    if (text.length < 10 || /^[^a-zA-Z]*$/.test(text)) {
      return;
    }

    const priority = getPriority(character);
    
    // If Game Master has priority and queue isn't empty, clear lower priority items
    if (priority === 1 && queueRef.current.length > 0) {
      queueRef.current = queueRef.current.filter(item => item.priority === 1);
    }

    queueRef.current.push({ text, character, priority });
    processQueue();
  }, [processQueue]);

  return {
    isPlaying,
    playVoice,
    stopVoice,
  };
}