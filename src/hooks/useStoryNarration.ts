import { useState, useCallback, useRef } from 'react';

interface StoryNarrationState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  currentNarration: string | null;
}

export function useStoryNarration() {
  const [state, setState] = useState<StoryNarrationState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    currentNarration: null
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopNarration = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isPlaying: false,
      isLoading: false,
      currentNarration: null
    }));
  }, []);

  const generateStoryNarration = useCallback(async (text: string, autoPlay: boolean = true) => {
    if (!text || text.trim().length < 5) {
      return;
    }

    // Stop any existing narration
    stopNarration();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      currentNarration: text
    }));

    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      console.log('🎭 Generating story narration for:', text.slice(0, 50) + '...');

      const response = await fetch('/api/generate-story-narration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Failed to generate story narration: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and configure audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadeddata = () => {
        setState(prev => ({
          ...prev,
          isLoading: false
        }));

        if (autoPlay) {
          audio.play().then(() => {
            setState(prev => ({
              ...prev,
              isPlaying: true
            }));
          }).catch((error) => {
            console.error('Failed to play story narration:', error);
            setState(prev => ({
              ...prev,
              error: 'Failed to play story narration',
              isLoading: false,
              isPlaying: false
            }));
          });
        }
      };

      audio.onended = () => {
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentNarration: null
        }));
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setState(prev => ({
          ...prev,
          error: 'Failed to load story narration audio',
          isLoading: false,
          isPlaying: false
        }));
        URL.revokeObjectURL(audioUrl);
      };

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Story narration request aborted');
        return;
      }

      console.error('Story narration error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to generate story narration',
        isLoading: false,
        isPlaying: false
      }));
    }
  }, [stopNarration]);

  const playPauseNarration = useCallback(() => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioRef.current.play().then(() => {
        setState(prev => ({ ...prev, isPlaying: true }));
      }).catch((error) => {
        console.error('Failed to play story narration:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to play story narration'
        }));
      });
    }
  }, [state.isPlaying]);

  return {
    ...state,
    generateStoryNarration,
    stopNarration,
    playPauseNarration
  };
}