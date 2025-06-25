import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GameState, Choice } from "@shared/schema";

export function useGameState() {
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('rpg-session-id');
    if (stored) return stored;
    const newId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('rpg-session-id', newId);
    return newId;
  });

  const queryClient = useQueryClient();

  const { data: gameState, isLoading } = useQuery<GameState>({
    queryKey: [`/api/game-state/${sessionId}`],
  });

  const choiceMutation = useMutation({
    mutationFn: async (choice: Choice) => {
      const response = await apiRequest('POST', '/api/make-choice', {
        sessionId,
        choice
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${sessionId}`] });
    }
  });

  // Add automatic progress saving
  const saveProgressMutation = useMutation({
    mutationFn: async (updates: Partial<GameState>) => {
      const response = await apiRequest('POST', '/api/save-progress', {
        sessionId,
        updates
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${sessionId}`] });
    }
  });

  const handleChoice = (choice: Choice) => {
    choiceMutation.mutate(choice);
  };

  const saveProgress = (updates: Partial<GameState>) => {
    saveProgressMutation.mutate(updates);
  };

  return {
    gameState,
    isLoading,
    handleChoice,
    saveProgress,
    isProcessing: choiceMutation.isPending,
    sessionId
  };
}
