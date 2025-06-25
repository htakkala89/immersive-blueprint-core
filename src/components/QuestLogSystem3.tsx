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
      className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: 'blur(60px) saturate(180%)',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4), rgba(0,0,0,0.7))'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden shadow-2xl liquid-glass-enhanced"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.75))',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.8)',
          position: 'relative'
        }}
      >
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px'
          }}
        />
        
        {/* Inner glow border */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(147,51,234,0.1), rgba(59,130,246,0.08))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            boxShadow: 'inset 0 0 20px rgba(147,51,234,0.1)'
          }}
        />
        {/* Header with Enhanced Liquid Glassmorphism */}
        <div className="relative p-6 border-b border-white/10 z-10">
          <div 
            className="absolute inset-0 backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(147,51,234,0.06))',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-xl border"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(147,51,234,0.1))',
                  border: '1px solid rgba(59,130,246,0.3)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'inset 0 0 20px rgba(59,130,246,0.1), 0 8px 32px rgba(59,130,246,0.15)'
                }}
              >
                <Crown 
                  className="w-8 h-8 text-blue-400" 
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.4))',
                    textShadow: '0 0 10px rgba(59,130,246,0.6)'
                  }}
                />
              </div>
              <div>
                <h2 
                  className="text-2xl font-bold text-white mb-1"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                    filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                  }}
                >
                  Quest Log
                </h2>
                <p 
                  className="text-slate-300"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                    filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.05))'
                  }}
                >
                  Monarch's Aura - Mission Command Center
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-300 hover:text-white transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <X 
                className="w-6 h-6" 
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                }}
              />
            </Button>
          </div>
        </div>

        {/* Tab Navigation with Enhanced Glassmorphism */}
        <div 
          className="flex border-b border-white/10 relative z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(30,41,59,0.4), rgba(15,23,42,0.6))',
            backdropFilter: 'blur(20px)'
          }}
        >
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 relative ${
              activeTab === 'active' 
                ? 'text-blue-300' 
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              background: activeTab === 'active' 
                ? 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.04))'
                : 'transparent'
            }}
          >
            {/* Glowing underline for active tab */}
            {activeTab === 'active' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.8), transparent)',
                  boxShadow: '0 0 8px rgba(59,130,246,0.6), 0 0 16px rgba(59,130,246,0.3)',
                  filter: 'blur(0.5px)'
                }}
              />
            )}
            <Target 
              className="w-5 h-5" 
              style={{
                filter: activeTab === 'active' 
                  ? 'drop-shadow(0 0 4px rgba(59,130,246,0.4))' 
                  : 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
              }}
            />
            <span 
              style={{
                textShadow: activeTab === 'active' 
                  ? '0 0 8px rgba(59,130,246,0.3), 0 1px 2px rgba(0,0,0,0.8)' 
                  : '0 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              Active Missions
            </span>
            {activeQuests.length > 0 && (
              <span 
                className="text-white text-xs rounded-full px-2 py-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(37,99,235,0.9))',
                  border: '1px solid rgba(59,130,246,0.3)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(59,130,246,0.3)',
                  textShadow: '0 1px 1px rgba(0,0,0,0.5)'
                }}
              >
                {activeQuests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 relative ${
              activeTab === 'completed' 
                ? 'text-green-300' 
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              background: activeTab === 'completed' 
                ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.04))'
                : 'transparent'
            }}
          >
            {/* Glowing underline for active tab */}
            {activeTab === 'completed' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.8), transparent)',
                  boxShadow: '0 0 8px rgba(34,197,94,0.6), 0 0 16px rgba(34,197,94,0.3)',
                  filter: 'blur(0.5px)'
                }}
              />
            )}
            <CheckCircle 
              className="w-5 h-5" 
              style={{
                filter: activeTab === 'completed' 
                  ? 'drop-shadow(0 0 4px rgba(34,197,94,0.4))' 
                  : 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
              }}
            />
            <span 
              style={{
                textShadow: activeTab === 'completed' 
                  ? '0 0 8px rgba(34,197,94,0.3), 0 1px 2px rgba(0,0,0,0.8)' 
                  : '0 1px 2px rgba(0,0,0,0.8)'
              }}
            >
              Completed Missions
            </span>
            {completedQuests.length > 0 && (
              <span 
                className="text-white text-xs rounded-full px-2 py-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.8), rgba(22,163,74,0.9))',
                  border: '1px solid rgba(34,197,94,0.3)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 8px rgba(34,197,94,0.3)',
                  textShadow: '0 1px 1px rgba(0,0,0,0.5)'
                }}
              >
                {completedQuests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Quest List with Enhanced Glassmorphism */}
          <div 
            className="w-1/2 border-r border-white/10 relative z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(30,41,59,0.3), rgba(15,23,42,0.5))',
              backdropFilter: 'blur(25px)'
            }}
          >
            <div className="p-6">
              <h3 
                className="text-lg font-semibold text-white mb-4"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                  filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                }}
              >
                {activeTab === 'active' ? 'Active Missions' : 'Mission History'}
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(activeTab === 'active' ? activeQuests : completedQuests).map((quest) => (
                  <motion.div
                    key={quest.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedQuest(quest)}
                    className="cursor-pointer transition-all duration-300 relative"
                    style={{
                      background: selectedQuest?.id === quest.id 
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.1))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                      backdropFilter: 'blur(15px)',
                      border: selectedQuest?.id === quest.id
                        ? '1px solid rgba(59,130,246,0.4)'
                        : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      boxShadow: selectedQuest?.id === quest.id
                        ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(59,130,246,0.2), 0 0 0 1px rgba(59,130,246,0.1)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.3)',
                      padding: '16px'
                    }}
                  >
                    {/* Subtle noise texture for quest cards */}
                    <div 
                      className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-2xl"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)'/%3E%3C/svg%3E")`,
                        backgroundSize: '120px 120px'
                      }}
                    />
                    <div className="flex items-start justify-between mb-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`p-2 rounded-lg border ${getRankColor(quest.rank)}`}
                          style={{
                            backdropFilter: 'blur(10px)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                          }}
                        >
                          <span 
                            className="font-bold text-sm"
                            style={{
                              textShadow: '0 0 4px currentColor, 0 1px 2px rgba(0,0,0,0.8)',
                              filter: 'drop-shadow(0 0 2px currentColor)'
                            }}
                          >
                            {quest.rank}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div style={{ filter: 'drop-shadow(0 0 4px currentColor) drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                            {getTypeIcon(quest.type)}
                          </div>
                          {quest.isUrgent && (
                            <AlertTriangle 
                              className="w-4 h-4 text-red-400" 
                              style={{
                                filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.6)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
                              }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-xs text-slate-300 mb-1"
                          style={{
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                            filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.05))'
                          }}
                        >
                          Progress
                        </div>
                        <div 
                          className="w-16 h-2 rounded-full overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.6))',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
                          }}
                        >
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${calculateProgress(quest)}%`,
                              background: 'linear-gradient(90deg, rgba(59,130,246,0.8), rgba(147,51,234,0.8))',
                              boxShadow: '0 0 8px rgba(59,130,246,0.4)'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <h4 
                      className="font-semibold text-white mb-2 line-clamp-2 relative z-10"
                      style={{
                        textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                        filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                      }}
                    >
                      {quest.title}
                    </h4>
                    <p 
                      className="text-sm text-slate-300 mb-3 line-clamp-2 relative z-10"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.05))'
                      }}
                    >
                      {quest.description}
                    </p>
                    
                    <div 
                      className="flex items-center justify-between text-xs text-slate-400 relative z-10"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin 
                          className="w-3 h-3" 
                          style={{
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
                          }}
                        />
                        <span 
                          className="capitalize"
                          style={{
                            textShadow: '0 1px 1px rgba(0,0,0,0.8)'
                          }}
                        >
                          {quest.targetLocation.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock 
                          className="w-3 h-3" 
                          style={{
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
                          }}
                        />
                        <span 
                          style={{
                            textShadow: '0 1px 1px rgba(0,0,0,0.8)'
                          }}
                        >
                          {formatDuration(quest.estimatedDuration)}
                        </span>
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

          {/* Quest Details with Enhanced Glassmorphism */}
          <div 
            className="flex-1 relative z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              backdropFilter: 'blur(30px)'
            }}
          >
            {selectedQuest ? (
              <div className="p-6 h-full overflow-y-auto relative z-10">
                {/* Subtle noise texture for details panel */}
                <div 
                  className="absolute inset-0 opacity-[0.02] pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter3)'/%3E%3C/svg%3E")`,
                    backgroundSize: '160px 160px'
                  }}
                />
                {/* Quest Header */}
                <div className="mb-6 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className={`p-3 rounded-xl border ${getRankColor(selectedQuest.rank)}`}
                      style={{
                        backdropFilter: 'blur(15px)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.3)'
                      }}
                    >
                      <span 
                        className="font-bold text-lg"
                        style={{
                          textShadow: '0 0 8px currentColor, 0 2px 4px rgba(0,0,0,0.8)',
                          filter: 'drop-shadow(0 0 4px currentColor)'
                        }}
                      >
                        {selectedQuest.rank}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="text-2xl font-bold text-white mb-2"
                        style={{
                          textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 12px rgba(255,255,255,0.1)',
                          filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.1))'
                        }}
                      >
                        {selectedQuest.title}
                      </h3>
                      <div 
                        className="flex items-center gap-4 text-sm text-slate-300"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div style={{ filter: 'drop-shadow(0 0 4px currentColor) drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
                            {getTypeIcon(selectedQuest.type)}
                          </div>
                          <span className="capitalize">{selectedQuest.type.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin 
                            className="w-4 h-4" 
                            style={{
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                            }}
                          />
                          <span className="capitalize">{selectedQuest.targetLocation.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar 
                            className="w-4 h-4" 
                            style={{
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                            }}
                          />
                          <span>{selectedQuest.sender}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mb-4 relative z-10">
                    <div 
                      className="flex justify-between text-sm mb-2"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      <span className="text-slate-300">Mission Progress</span>
                      <span 
                        className="text-white font-semibold"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 4px rgba(255,255,255,0.1)'
                        }}
                      >
                        {Math.round(calculateProgress(selectedQuest))}%
                      </span>
                    </div>
                    <div 
                      className="w-full h-3 rounded-full overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.6))',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)'
                      }}
                    >
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${calculateProgress(selectedQuest)}%`,
                          background: 'linear-gradient(90deg, rgba(59,130,246,0.9), rgba(147,51,234,0.9), rgba(236,72,153,0.8))',
                          boxShadow: '0 0 12px rgba(59,130,246,0.6), inset 0 1px 0 rgba(255,255,255,0.2)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Mission Briefing */}
                <div className="mb-6 relative z-10">
                  <h4 
                    className="text-lg font-semibold text-white mb-3 flex items-center gap-2"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                      filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                    }}
                  >
                    <Shield 
                      className="w-5 h-5" 
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                      }}
                    />
                    Mission Briefing
                  </h4>
                  <div 
                    className="rounded-lg p-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.3)'
                    }}
                  >
                    <p 
                      className="text-slate-300 leading-relaxed"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.05))'
                      }}
                    >
                      {selectedQuest.longDescription}
                    </p>
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