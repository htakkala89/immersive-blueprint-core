import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useGameState } from "@/hooks/useGameState";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedSkillTree } from "@/components/EnhancedSkillTree";
import { 
  Home as HomeIcon, Heart, Sword, Moon, Sun, Coffee, MessageCircle, 
  Calendar, Settings, Crown, MapPin, Gift, Clock, Zap, Shield
} from "lucide-react";

interface TimeOfDay {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface ChaMessage {
  id: string;
  text: string;
  timestamp: number;
  type: 'greeting' | 'question' | 'memory' | 'suggestion' | 'affection';
  responses?: { text: string; affectionChange: number }[];
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const { gameState, isLoading, handleChoice } = useGameState();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [chaMessages, setChaMessages] = useState<ChaMessage[]>([]);
  const [selectedTab, setSelectedTab] = useState("home");
  const queryClient = useQueryClient();

  // Day/Night cycle
  const timeOfDay: TimeOfDay = (() => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return { name: "Morning", icon: Sun, color: "yellow", period: 'morning' };
    if (hour >= 12 && hour < 18) return { name: "Afternoon", icon: Sun, color: "orange", period: 'afternoon' };
    if (hour >= 18 && hour < 22) return { name: "Evening", icon: Moon, color: "purple", period: 'evening' };
    return { name: "Night", icon: Moon, color: "blue", period: 'night' };
  })();

  // Auto-advance time every 30 seconds for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => new Date(prev.getTime() + 30 * 60 * 1000)); // +30 minutes
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate Cha Hae-In messages based on time and relationship
  useEffect(() => {
    const generateChaMessage = () => {
      const messages: ChaMessage[] = [
        {
          id: `morning_${Date.now()}`,
          text: timeOfDay.period === 'morning' ? 
            "Good morning, Jin-Woo! I was just thinking about our last raid together. Your shadow soldiers have gotten even stronger, haven't they?" :
            "I've been reviewing some A-rank gate data. Want to tackle one together? I think we make a good team.",
          timestamp: Date.now(),
          type: 'memory',
          responses: [
            { text: "Let's go raiding together", affectionChange: 2 },
            { text: "Tell me more about what you noticed", affectionChange: 1 },
            { text: "Maybe later, I'm busy", affectionChange: -1 }
          ]
        },
        {
          id: `affection_${Date.now()}`,
          text: "Jin-Woo... being around you feels different from being with other hunters. You make me feel... safe, yet excited at the same time.",
          timestamp: Date.now(),
          type: 'affection',
          responses: [
            { text: "You mean everything to me, Hae-In", affectionChange: 3 },
            { text: "I feel the same way about you", affectionChange: 2 },
            { text: "We're good partners", affectionChange: 1 }
          ]
        },
        {
          id: `suggestion_${Date.now()}`,
          text: timeOfDay.period === 'evening' ?
            "The sunset looks beautiful from the balcony. Would you like to watch it with me?" :
            "I found this cute café that serves amazing pastries. Want to check it out together?",
          timestamp: Date.now(),
          type: 'suggestion',
          responses: [
            { text: "I'd love to spend time with you", affectionChange: 2 },
            { text: "That sounds nice", affectionChange: 1 },
            { text: "I'm not in the mood right now", affectionChange: -1 }
          ]
        }
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setChaMessages(prev => [randomMessage, ...prev.slice(0, 4)]);
    };

    // Generate message every 2 minutes
    const messageInterval = setInterval(generateChaMessage, 120000);
    
    // Generate initial message
    if (chaMessages.length === 0) {
      setTimeout(generateChaMessage, 5000);
    }

    return () => clearInterval(messageInterval);
  }, [timeOfDay.period, chaMessages.length]);

  // Sleep/Rest functionality
  const sleepMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/add-experience', {
        sessionId: gameState?.sessionId,
        amount: 50,
        source: "rest and recovery"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${gameState?.sessionId}`] });
      setCurrentTime(prev => new Date(prev.getTime() + 8 * 60 * 60 * 1000)); // +8 hours
    }
  });

  const handleChaResponse = (messageId: string, response: { text: string; affectionChange: number }) => {
    // Remove the message and apply affection change
    setChaMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    // Here you would update the game state with affection changes
    console.log(`Affection changed by: ${response.affectionChange}`);
  };

  const activities = [
    {
      id: 'dungeon_raid',
      title: 'Dungeon Raid with Hae-In',
      description: 'Team up for an S-rank gate raid. High risk, high reward.',
      icon: '⚔️',
      energyCost: 30,
      expReward: 200,
      available: timeOfDay.period !== 'night'
    },
    {
      id: 'romantic_date',
      title: 'Romantic Date',
      description: timeOfDay.period === 'evening' ? 'Dinner date at a fancy restaurant' : 'Afternoon stroll through the city',
      icon: '💕',
      energyCost: 20,
      affectionReward: 3,
      available: true
    },
    {
      id: 'casual_chat',
      title: 'Chat with Hae-In',
      description: 'Have a deep conversation about your lives as hunters',
      icon: '💬',
      energyCost: 10,
      affectionReward: 1,
      available: true
    },
    {
      id: 'training',
      title: 'Joint Training',
      description: 'Practice combat techniques together',
      icon: '🏋️',
      energyCost: 25,
      expReward: 100,
      available: timeOfDay.period === 'morning' || timeOfDay.period === 'afternoon'
    },
    {
      id: 'rest',
      title: 'Sleep Together',
      description: 'Rest and recover your energy. Time advances 8 hours.',
      icon: '😴',
      energyCost: 0,
      healthRestore: 100,
      manaRestore: 100,
      available: timeOfDay.period === 'night'
    }
  ];

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const TimeIcon = timeOfDay.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/20 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HomeIcon className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold">Jin-Woo & Hae-In's Home</h1>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <TimeIcon className={`h-4 w-4 text-${timeOfDay.color}-400`} />
                  <span>{timeOfDay.name}</span>
                  <span className="text-gray-500">•</span>
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-300">Level {gameState.level}</div>
                <div className="text-xs text-gray-400">{gameState.experience} XP</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSkillTree(true)}
                className="bg-purple-600 hover:bg-purple-700 border-purple-500"
              >
                <Crown className="h-4 w-4 mr-2" />
                Skills
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4" />
              Home
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Card */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-blue-400" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Health</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(gameState.health / gameState.maxHealth) * 100} className="w-20" />
                      <span className="text-sm">{gameState.health}/{gameState.maxHealth}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Mana</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(gameState.mana / gameState.maxMana) * 100} className="w-20" />
                      <span className="text-sm">{gameState.mana}/{gameState.maxMana}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Energy</span>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm">85/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Relationship Card */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Heart className="h-5 w-5 text-red-400" />
                    Relationship
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400 mb-1">❤️ Deeply in Love</div>
                    <div className="text-sm text-gray-300">Living Together</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Affection</span>
                      <span>95/100</span>
                    </div>
                    <Progress value={95} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Days Together</span>
                      <span>127</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5 text-green-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {activities.slice(0, 3).map(activity => (
                    <Button
                      key={activity.id}
                      variant="outline"
                      className="w-full justify-start bg-white/5 hover:bg-white/10 border-white/20"
                      onClick={() => setSelectedTab("activities")}
                    >
                      <span className="mr-2">{activity.icon}</span>
                      {activity.title}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Messages */}
            {chaMessages.length > 0 && (
              <Card className="bg-black/40 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Cha Hae-In</CardTitle>
                  <CardDescription>She has something to say...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chaMessages.slice(0, 1).map(message => (
                      <div key={message.id} className="space-y-3">
                        <div className="bg-purple-600/20 p-4 rounded-lg">
                          <p className="text-gray-100">{message.text}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.responses?.map((response, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => handleChaResponse(message.id, response)}
                              className="bg-white/5 hover:bg-white/10 border-white/20"
                            >
                              {response.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map(activity => (
                <Card 
                  key={activity.id}
                  className={`bg-black/40 backdrop-blur-sm border-white/20 transition-all hover:scale-105 ${
                    !activity.available ? 'opacity-50' : 'cursor-pointer hover:bg-white/5'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <span className="text-2xl">{activity.icon}</span>
                      {activity.title}
                    </CardTitle>
                    <CardDescription>{activity.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {activity.energyCost > 0 && (
                        <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/50">
                          -{activity.energyCost} Energy
                        </Badge>
                      )}
                      {activity.expReward && (
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                          +{activity.expReward} XP
                        </Badge>
                      )}
                      {activity.affectionReward && (
                        <Badge variant="outline" className="bg-pink-500/20 text-pink-300 border-pink-500/50">
                          +{activity.affectionReward} ❤️
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      className="w-full"
                      disabled={!activity.available}
                      onClick={() => {
                        if (activity.id === 'rest') {
                          sleepMutation.mutate();
                        } else {
                          // Handle other activities
                          console.log(`Starting activity: ${activity.id}`);
                        }
                      }}
                    >
                      {activity.available ? 'Start Activity' : 'Not Available'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Conversation with Cha Hae-In</CardTitle>
                <CardDescription>Deep conversations and shared memories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {chaMessages.map(message => (
                  <div key={message.id} className="space-y-3">
                    <div className="bg-purple-600/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-gray-300">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {message.type}
                        </Badge>
                      </div>
                      <p className="text-gray-100">{message.text}</p>
                    </div>
                    {message.responses && (
                      <div className="flex flex-wrap gap-2 ml-4">
                        {message.responses.map((response, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => handleChaResponse(message.id, response)}
                            className="bg-white/5 hover:bg-white/10 border-white/20"
                          >
                            {response.text}
                            {response.affectionChange > 0 && (
                              <span className="ml-1 text-red-400">+{response.affectionChange}❤️</span>
                            )}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/40 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Character Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-300">Strength</div>
                      <div className="text-xl font-bold">{gameState.stats.strength}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">Agility</div>
                      <div className="text-xl font-bold">{gameState.stats.agility}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">Intelligence</div>
                      <div className="text-xl font-bold">{gameState.stats.intelligence}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">Vitality</div>
                      <div className="text-xl font-bold">{gameState.stats.vitality}</div>
                    </div>
                  </div>
                  
                  {gameState.statPoints > 0 && (
                    <div className="pt-4 border-t border-white/20">
                      <div className="text-sm text-gray-300 mb-2">Available Points: {gameState.statPoints}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(gameState.stats).map(stat => (
                          <Button key={stat} variant="outline" size="sm" className="text-xs">
                            +{stat}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Progression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Experience</span>
                      <span>{gameState.experience}</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-300">Recent Activity</div>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>• Completed S-rank gate (+200 XP)</div>
                      <div>• Romantic dinner with Hae-In (+3 Affection)</div>
                      <div>• Joint training session (+100 XP)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Skill Tree Modal */}
      {showSkillTree && gameState && (
        <EnhancedSkillTree
          gameState={gameState}
          onClose={() => setShowSkillTree(false)}
          sessionId={gameState.sessionId}
        />
      )}
    </div>
  );
}