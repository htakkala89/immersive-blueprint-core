// System 9: AI Narrative Engine - Story Progression Display
// Shows persistent story memory, character development, and dynamic world events

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Heart, Brain, Clock, MapPin, Zap, Eye, ChevronDown, ChevronUp } from "lucide-react";

interface StoryMemory {
  id: string;
  timestamp: Date;
  event: string;
  location: string;
  participants: string[];
  emotionalImpact: number;
  storyTags: string[];
  consequences: string[];
}

interface EmotionalState {
  characterId: string;
  currentMood: Record<string, number>;
  relationshipDynamics: Record<string, number>;
  growthTrajectory: string[];
}

interface WorldEvent {
  id: string;
  type: 'gate_outbreak' | 'hunter_politics' | 'relationship_milestone' | 'personal_growth';
  title: string;
  description: string;
  isTriggered: boolean;
  triggerDate?: Date;
}

interface NarrativeContext {
  recentMemories: StoryMemory[];
  currentChapter: number;
  storyTitle: string;
  narrativeTension: number;
  pacing: 'slow' | 'moderate' | 'intense' | 'climactic';
  emotionalSummary: {
    dominantMood: [string, number];
    relationshipLevel: [string, number];
  } | null;
  worldEvents: WorldEvent[];
}

interface NarrativeProgressionProps {
  playerId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function NarrativeProgressionSystem9({ playerId, isVisible, onClose }: NarrativeProgressionProps) {
  const [narrativeContext, setNarrativeContext] = useState<NarrativeContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'memories' | 'emotions' | 'events'>('memories');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isVisible && playerId) {
      fetchNarrativeContext();
    }
  }, [isVisible, playerId]);

  const fetchNarrativeContext = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/narrative-context/${playerId}`);
      const data = await response.json();
      setNarrativeContext(data);
    } catch (error) {
      console.error('Failed to fetch narrative context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happiness: 'text-yellow-400',
      confidence: 'text-blue-400',
      attraction: 'text-pink-400',
      trust: 'text-green-400',
      openness: 'text-purple-400',
      professional_respect: 'text-cyan-400',
      personal_affection: 'text-rose-400',
      romantic_tension: 'text-red-400',
      emotional_intimacy: 'text-violet-400'
    };
    return colors[emotion as keyof typeof colors] || 'text-white';
  };

  const getPacingColor = (pacing: string) => {
    const colors = {
      slow: 'text-green-400',
      moderate: 'text-yellow-400',
      intense: 'text-orange-400',
      climactic: 'text-red-400'
    };
    return colors[pacing as keyof typeof colors] || 'text-white';
  };

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-slate-900/95 to-gray-900/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-4xl mx-4 w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">Narrative Engine</h2>
                <p className="text-white/60">Story Progression & Character Development</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white/60 hover:bg-white/10"
            >
              ×
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <span className="ml-3 text-white/60">Loading narrative context...</span>
            </div>
          ) : narrativeContext ? (
            <div className="space-y-6">
              {/* Story Progress Overview */}
              <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold">{narrativeContext.storyTitle}</h3>
                    <p className="text-white/60">Chapter {narrativeContext.currentChapter}</p>
                  </div>
                  <div className="text-center">
                    <Zap className={`w-8 h-8 mx-auto mb-2 ${getPacingColor(narrativeContext.pacing)}`} />
                    <h3 className="text-white font-semibold">Narrative Pacing</h3>
                    <p className="text-white/60 capitalize">{narrativeContext.pacing}</p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold">Story Tension</h3>
                    <div className="mt-2">
                      <Progress 
                        value={narrativeContext.narrativeTension * 100} 
                        className="w-full h-2"
                      />
                      <p className="text-white/60 text-sm mt-1">
                        {Math.round(narrativeContext.narrativeTension * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Emotional State */}
              {narrativeContext.emotionalSummary && (
                <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Cha Hae-In's Current State
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Dominant Mood</p>
                      <p className={`font-semibold ${getEmotionColor(narrativeContext.emotionalSummary.dominantMood[0])}`}>
                        {narrativeContext.emotionalSummary.dominantMood[0].replace('_', ' ')} 
                        <span className="text-white/60 ml-2">
                          ({Math.round(narrativeContext.emotionalSummary.dominantMood[1] * 100)}%)
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Relationship Dynamic</p>
                      <p className={`font-semibold ${getEmotionColor(narrativeContext.emotionalSummary.relationshipLevel[0])}`}>
                        {narrativeContext.emotionalSummary.relationshipLevel[0].replace('_', ' ')}
                        <span className="text-white/60 ml-2">
                          ({Math.round(narrativeContext.emotionalSummary.relationshipLevel[1] * 100)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex gap-2">
                {[
                  { id: 'memories', label: 'Recent Memories', icon: Clock },
                  { id: 'events', label: 'World Events', icon: MapPin }
                ].map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    variant={activeTab === id ? "default" : "ghost"}
                    className={`flex items-center gap-2 ${
                      activeTab === id 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-black/40 rounded-2xl border border-white/10 max-h-96 overflow-y-auto">
                {activeTab === 'memories' && (
                  <div className="p-6 space-y-4">
                    <h3 className="text-white font-semibold">Recent Story Memories</h3>
                    {narrativeContext.recentMemories.length > 0 ? (
                      narrativeContext.recentMemories.map((memory) => (
                        <div key={memory.id} className="border-l-2 border-purple-400/30 pl-4 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-purple-400" />
                              <span className="text-white/60 text-sm">{memory.location}</span>
                              <span className="text-white/40 text-sm">
                                {formatTimestamp(memory.timestamp.toString())}
                              </span>
                            </div>
                            <Button
                              onClick={() => toggleDetails(memory.id)}
                              variant="ghost"
                              size="sm"
                              className="text-white/60 hover:bg-white/10"
                            >
                              {showDetails[memory.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                          </div>
                          <p className="text-white text-sm mb-2">{memory.event}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {memory.storyTags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                          
                          <AnimatePresence>
                            {showDetails[memory.id] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 text-white/60 text-sm"
                              >
                                <p><strong>Emotional Impact:</strong> {memory.emotionalImpact}/10</p>
                                {memory.consequences.length > 0 && (
                                  <p><strong>Consequences:</strong> {memory.consequences.join(', ')}</p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    ) : (
                      <p className="text-white/60 text-center py-8">No story memories yet. Start conversations to build your narrative!</p>
                    )}
                  </div>
                )}

                {activeTab === 'events' && (
                  <div className="p-6 space-y-4">
                    <h3 className="text-white font-semibold">Dynamic World Events</h3>
                    {narrativeContext.worldEvents.filter(e => e.isTriggered).length > 0 ? (
                      narrativeContext.worldEvents
                        .filter(event => event.isTriggered)
                        .map((event) => (
                          <div key={event.id} className="border border-green-400/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                {event.type.replace('_', ' ')}
                              </Badge>
                              {event.triggerDate && (
                                <span className="text-white/40 text-sm">
                                  {formatTimestamp(event.triggerDate.toString())}
                                </span>
                              )}
                            </div>
                            <h4 className="text-white font-medium mb-1">{event.title}</h4>
                            <p className="text-white/60 text-sm">{event.description}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-white/60 text-center py-8">No world events triggered yet. Continue your story to unlock narrative milestones!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60">Failed to load narrative context</p>
              <Button 
                onClick={fetchNarrativeContext}
                variant="outline"
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}