import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Clock, Coins, Star, Shield, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Quest } from '@shared/schema';

interface QuestBoardProps {
  isVisible: boolean;
  onClose: () => void;
  playerLevel: number;
  onAcceptQuest: (quest: Quest) => void;
  activeQuests: string[];
}

const AVAILABLE_QUESTS: Quest[] = [
  {
    id: 'clear_c_rank_gate',
    title: 'C-Rank Gate Clearance - Hongdae',
    description: 'A C-rank dungeon has appeared in Hongdae district. Clear it before it breaks and monsters spill into the city.',
    location: 'hongdae_cafe',
    difficulty: 'C',
    reward: {
      gold: 15000000,
      experience: 2500,
      items: ['mana_crystal_rare', 'monster_core_uncommon']
    },
    requirements: {
      level: 15
    },
    status: 'available'
  },
  {
    id: 'investigate_mana_signature',
    title: 'Unusual Mana Investigation',
    description: 'Strange mana readings detected near Gangnam Tower. Investigate and report findings to the Hunter Association.',
    location: 'gangnam_tower',
    difficulty: 'B',
    reward: {
      gold: 25000000,
      experience: 4000,
      items: ['equipment_rare', 'mana_crystal_epic']
    },
    requirements: {
      level: 25
    },
    status: 'available'
  },
  {
    id: 'escort_vip_hunter',
    title: 'VIP Hunter Escort Mission',
    description: 'Escort a high-ranking guild member through dangerous territory. Discretion and combat readiness required.',
    location: 'myeongdong_restaurant',
    difficulty: 'A',
    reward: {
      gold: 50000000,
      experience: 7500,
      items: ['equipment_epic', 'monster_core_rare']
    },
    requirements: {
      level: 35,
      completedQuests: ['investigate_mana_signature']
    },
    status: 'available'
  },
  {
    id: 'emergency_gate_response',
    title: 'Emergency S-Rank Gate Response',
    description: 'URGENT: S-rank gate detected. All available S-rank hunters report immediately. High casualty risk.',
    location: 'hunter_association',
    difficulty: 'S',
    reward: {
      gold: 100000000,
      experience: 15000,
      items: ['equipment_legendary', 'mana_crystal_legendary', 'monster_core_epic']
    },
    requirements: {
      level: 50
    },
    status: 'available'
  },
  {
    id: 'training_facility_maintenance',
    title: 'Training Facility Equipment Test',
    description: 'Help test new training equipment at the Elite Hunter Training Center. Combat data collection required.',
    location: 'training_facility',
    difficulty: 'D',
    reward: {
      gold: 5000000,
      experience: 1000,
      items: ['equipment_uncommon']
    },
    requirements: {
      level: 10
    },
    status: 'available'
  },
  {
    id: 'market_security_patrol',
    title: 'Hunter Market Security Patrol',
    description: 'Patrol the Hunter Market during peak hours. Prevent theft and maintain order among traders.',
    location: 'hunter_market',
    difficulty: 'E',
    reward: {
      gold: 2000000,
      experience: 500,
      items: ['mana_crystal_common']
    },
    requirements: {
      level: 5
    },
    status: 'available'
  }
];

export default function QuestBoard({ 
  isVisible, 
  onClose, 
  playerLevel, 
  onAcceptQuest,
  activeQuests 
}: QuestBoardProps) {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const formatGold = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₩', '₩ ');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'S': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'A': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'B': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'C': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'D': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'E': return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const isQuestAvailable = (quest: Quest) => {
    if (activeQuests.includes(quest.id)) return false;
    if (quest.requirements?.level && playerLevel < quest.requirements.level) return false;
    // Add more requirement checks here
    return true;
  };

  const availableQuests = AVAILABLE_QUESTS.filter(isQuestAvailable);
  const unavailableQuests = AVAILABLE_QUESTS.filter(quest => !isQuestAvailable(quest));

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Quest Board Interface */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-br from-blue-900 via-black to-blue-900 border border-blue-500/30 rounded-3xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Hunter Association Quest Board</h2>
              <p className="text-blue-200 text-sm">Official missions and bounties</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-blue-200 text-xs">Hunter Level</p>
              <p className="text-white text-lg font-bold">{playerLevel}</p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="icon"
              className="border-gray-600 hover:border-gray-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Quest Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Available Quests */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Available Missions
            </h3>
            
            {availableQuests.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No missions available at your current level</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableQuests.map((quest) => (
                  <motion.div
                    key={quest.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-800/50 border border-gray-600 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg hover:border-blue-400/50"
                    onClick={() => setSelectedQuest(quest)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white text-sm">{quest.title}</h4>
                      <div className={`${getDifficultyColor(quest.difficulty)} border rounded px-2 py-1 text-xs font-bold`}>
                        {quest.difficulty}-Rank
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3 line-clamp-2">{quest.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          Reward:
                        </span>
                        <span className="font-mono text-sm text-green-400">{formatGold(quest.reward.gold)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Experience:
                        </span>
                        <span className="text-sm text-blue-400">{quest.reward.experience.toLocaleString()} XP</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Locked Quests */}
          {unavailableQuests.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-400 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Locked Missions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unavailableQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className="bg-gray-900/50 border border-red-500/30 rounded-xl p-4 opacity-60"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-300 text-sm">{quest.title}</h4>
                      <div className={`${getDifficultyColor(quest.difficulty)} border rounded px-2 py-1 text-xs font-bold opacity-50`}>
                        {quest.difficulty}-Rank
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3">
                      {quest.requirements?.level && playerLevel < quest.requirements.level
                        ? `Requires Level ${quest.requirements.level}`
                        : 'Requirements not met'}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Reward:</span>
                      <span className="font-mono text-sm text-gray-500">{formatGold(quest.reward.gold)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quest Details Dialog */}
        <AnimatePresence>
          {selectedQuest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-blue-500/30 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedQuest.title}</h3>
                  <div className={`${getDifficultyColor(selectedQuest.difficulty)} border rounded px-3 py-1 text-sm font-bold`}>
                    {selectedQuest.difficulty}-Rank
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6">{selectedQuest.description}</p>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      Mission Rewards
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gold Payment:</span>
                        <span className="text-green-400 font-mono">{formatGold(selectedQuest.reward.gold)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Experience:</span>
                        <span className="text-blue-400">{selectedQuest.reward.experience.toLocaleString()} XP</span>
                      </div>
                      {selectedQuest.reward.items && (
                        <div>
                          <span className="text-gray-400">Additional Items:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedQuest.reward.items.map((item, index) => (
                              <span key={index} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded text-xs">
                                {item.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Mission Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white capitalize">{selectedQuest.location.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Difficulty:</span>
                        <span className={getDifficultyColor(selectedQuest.difficulty).split(' ')[0]}>{selectedQuest.difficulty}-Rank</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedQuest(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onAcceptQuest(selectedQuest);
                      setSelectedQuest(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Accept Mission
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}