import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GameState, CharacterStats } from "@shared/schema";

export function useCharacterProgression(sessionId: string) {
  const queryClient = useQueryClient();

  const levelUpMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/level-up", { sessionId });
      return response.json();
    },
    onSuccess: (gameState) => {
      queryClient.setQueryData(["/api/game-state", sessionId], gameState);
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
    },
  });

  const upgradeSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const response = await apiRequest("POST", "/api/upgrade-skill", { sessionId, skillId });
      return response.json();
    },
    onSuccess: (gameState) => {
      queryClient.setQueryData(["/api/game-state", sessionId], gameState);
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
    },
  });

  const allocateStatMutation = useMutation({
    mutationFn: async (stat: keyof CharacterStats) => {
      const response = await apiRequest("POST", "/api/allocate-stat", { sessionId, stat });
      return response.json();
    },
    onSuccess: (gameState) => {
      queryClient.setQueryData(["/api/game-state", sessionId], gameState);
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
    },
  });

  return {
    levelUp: levelUpMutation.mutate,
    upgradeSkill: upgradeSkillMutation.mutate,
    allocateStat: allocateStatMutation.mutate,
    isLevelingUp: levelUpMutation.isPending,
    isUpgradingSkill: upgradeSkillMutation.isPending,
    isAllocatingStat: allocateStatMutation.isPending,
  };
}