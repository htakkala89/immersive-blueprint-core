import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  Clock, 
  MapPin, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Crown,
  Sword,
  Users,
  Search,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
  progress?: number;
  target?: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  type: 'gate_clearance' | 'monster_hunt' | 'escort' | 'investigation' | 'emergency';
  sender: string;
  targetLocation: string;
  objectives: QuestObjective[];
  rewards: {
    gold: number;
    experience: number;
    items?: string[];
    affection?: number;
  };
  timeLimit?: number;
  difficulty: number;
  status: 'received' | 'accepted' | 'in_progress' | 'completed' | 'failed' | 'expired';
  acceptedAt?: string;
  completedAt?: string;
  receivedAt: string;
  estimatedDuration: number;
  prerequisites?: string[];
  isUrgent: boolean;
  guildSupport: boolean;
}

interface QuestLogSystem3Props {
  isVisible: boolean;
  onClose: () => void;
  activeQuests: Quest[];
  completedQuests: Quest[];
  onQuestTrack: (questId: string) => void;
  onQuestAbandon: (questId: string) => void;
}

export function QuestLogSystem3({
  isVisible,
  onClose,
  activeQuests,
  completedQuests,
  onQuestTrack,
  onQuestAbandon
}: QuestLogSystem3Props) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'S': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'A': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'B': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'C': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'D': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'E': return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gate_clearance': return <Shield className="w-4 h-4" />;
      case 'monster_hunt': return <Sword className="w-4 h-4" />;
      case 'escort': return <Users className="w-4 h-4" />;
      case 'investigation': return <Search className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const formatGold = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₩', '₩ ');
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const calculateProgress = (quest: Quest) => {
    const completed = quest.objectives.filter(obj => obj.completed).length;
    return (completed / quest.objectives.length) * 100;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header with Liquid Glassmorphism */}
        <div className="relative p-6 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-400/30">
                <Crown className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Quest Log</h2>
                <p className="text-slate-400">Monarch's Aura - Mission Command Center</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-800/50">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-all ${
              activeTab === 'active' 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="w-5 h-5" />
            Active Missions
            {activeQuests.length > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {activeQuests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-all ${
              activeTab === 'completed' 
                ? 'text-green-400 border-b-2 border-green-400 bg-green-400/5' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Completed Missions
            {completedQuests.length > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                {completedQuests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Quest List */}
          <div className="w-1/2 border-r border-white/10 bg-slate-800/30">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {activeTab === 'active' ? 'Active Missions' : 'Mission History'}
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(activeTab === 'active' ? activeQuests : completedQuests).map((quest) => (
                  <motion.div
                    key={quest.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedQuest(quest)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedQuest?.id === quest.id 
                        ? 'bg-blue-500/20 border-blue-400/50' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${getRankColor(quest.rank)}`}>
                          <span className="font-bold text-sm">{quest.rank}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(quest.type)}
                          {quest.isUrgent && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 mb-1">Progress</div>
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-400 transition-all"
                            style={{ width: `${calculateProgress(quest)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-white mb-2 line-clamp-2">{quest.title}</h4>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{quest.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="capitalize">{quest.targetLocation.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(quest.estimatedDuration)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {(activeTab === 'active' ? activeQuests : completedQuests).length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-slate-500 mb-2">
                      {activeTab === 'active' ? <Target className="w-12 h-12 mx-auto mb-4 opacity-50" /> : <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />}
                    </div>
                    <p className="text-slate-400">
                      {activeTab === 'active' ? 'No active missions' : 'No completed missions'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {activeTab === 'active' ? 'Accept missions from the Hunter\'s Communicator' : 'Complete missions to see them here'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quest Details */}
          <div className="flex-1 bg-slate-900/50">
            {selectedQuest ? (
              <div className="p-6 h-full overflow-y-auto">
                {/* Quest Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl border ${getRankColor(selectedQuest.rank)}`}>
                      <span className="font-bold text-lg">{selectedQuest.rank}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{selectedQuest.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(selectedQuest.type)}
                          <span className="capitalize">{selectedQuest.type.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="capitalize">{selectedQuest.targetLocation.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{selectedQuest.sender}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Mission Progress</span>
                      <span className="text-white">{Math.round(calculateProgress(selectedQuest))}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${calculateProgress(selectedQuest)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mission Briefing */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Mission Briefing
                  </h4>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-slate-300 leading-relaxed">{selectedQuest.longDescription}</p>
                  </div>
                </div>

                {/* Objectives */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Objectives
                  </h4>
                  <div className="space-y-2">
                    {selectedQuest.objectives.map((objective, index) => (
                      <div 
                        key={objective.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          objective.completed ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          objective.completed ? 'bg-green-500' : 'bg-slate-600'
                        }`}>
                          {objective.completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          )}
                        </div>
                        <span className={`flex-1 ${objective.completed ? 'text-green-300 line-through' : 'text-white'}`}>
                          {objective.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rewards */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Mission Rewards
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Gold Reward</div>
                      <div className="text-xl font-bold text-yellow-400">{formatGold(selectedQuest.rewards.gold)}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-1">Experience</div>
                      <div className="text-xl font-bold text-blue-400">{selectedQuest.rewards.experience.toLocaleString()} XP</div>
                    </div>
                    {selectedQuest.rewards.affection && selectedQuest.rewards.affection > 0 && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Affection Bonus</div>
                        <div className="text-xl font-bold text-pink-400">+{selectedQuest.rewards.affection}</div>
                      </div>
                    )}
                    {selectedQuest.rewards.items && selectedQuest.rewards.items.length > 0 && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-1">Items</div>
                        <div className="text-sm text-white">
                          {selectedQuest.rewards.items.map((item, index) => (
                            <div key={index} className="text-purple-400">{item}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedQuest.status === 'accepted' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => onQuestTrack(selectedQuest.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Track on World Map
                    </Button>
                    <Button
                      onClick={() => onQuestAbandon(selectedQuest.id)}
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      Abandon Mission
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg mb-2">Select a Mission</p>
                  <p className="text-sm">Choose a mission from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}