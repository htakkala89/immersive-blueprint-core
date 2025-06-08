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
      return apiRequest("/api/upgrade-skill", {
        method: "POST",
        body: JSON.stringify({ sessionId, skillId }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (gameState) => {
      queryClient.setQueryData(["/api/game-state", sessionId], gameState);
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
    },
  });

  const allocateStatMutation = useMutation({
    mutationFn: async (stat: keyof CharacterStats) => {
      return apiRequest<GameState>("/api/allocate-stat", {
        method: "POST",
        body: JSON.stringify({ sessionId, stat }),
        headers: { "Content-Type": "application/json" },
      });
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