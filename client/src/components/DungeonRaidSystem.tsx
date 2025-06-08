import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sword, Shield, Zap, Eye, Heart, Skull, Crown, Star, 
  Flame, Snowflake, Bolt, Wind, Target, Users 
} from "lucide-react";

interface DungeonFloor {
  level: number;
  name: string;
  description: string;
  difficulty: 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
  enemyCount: number;
  bossType: string;
  rewards: {
    experience: number;
    gold: number;
    items: Array<{ name: string; rarity: string; chance: number }>;
    shadowExtractions: Array<{ name: string; type: string; rarity: string }>;
  };
  requirements: {
    minLevel: number;
    maxShadows: number;
  };
}

interface ShadowSoldier {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  type: 'knight' | 'archer' | 'mage' | 'assassin' | 'beast' | 'elite';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  abilities: Array<{
    name: string;
    damage: number;
    manaCost: number;
    cooldown: number;
    description: string;
  }>;
  experience: number;
  maxExperience: number;
}

interface DungeonRaidProps {
  isVisible: boolean;
  onClose: () => void;
  playerLevel: number;
  shadowArmy: ShadowSoldier[];
  onShadowGain: (shadow: ShadowSoldier) => void;
  onExperienceGain: (exp: number) => void;
}

const DUNGEON_FLOORS: DungeonFloor[] = [
  {
    level: 1,
    name: "Spider's Den",
    description: "A cavern filled with giant spiders and their poisonous offspring",
    difficulty: 'E',
    enemyCount: 8,
    bossType: "Giant Spider Queen",
    rewards: {
      experience: 150,
      gold: 500,
      items: [
        { name: "Spider Silk", rarity: "common", chance: 0.8 },
        { name: "Poison Fang", rarity: "rare", chance: 0.3 }
      ],
      shadowExtractions: [
        { name: "Shadow Spider", type: "beast", rarity: "common" }
      ]
    },
    requirements: { minLevel: 5, maxShadows: 3 }
  },
  {
    level: 5,
    name: "Goblin Fortress",
    description: "An underground fortress controlled by organized goblin tribes",
    difficulty: 'D',
    enemyCount: 15,
    bossType: "Goblin Chieftain",
    rewards: {
      experience: 400,
      gold: 1200,
      items: [
        { name: "Goblin Blade", rarity: "rare", chance: 0.4 },
        { name: "Chieftain's Crown", rarity: "epic", chance: 0.1 }
      ],
      shadowExtractions: [
        { name: "Shadow Goblin Warrior", type: "knight", rarity: "common" },
        { name: "Shadow Goblin Archer", type: "archer", rarity: "rare" }
      ]
    },
    requirements: { minLevel: 15, maxShadows: 5 }
  },
  {
    level: 10,
    name: "Ice Dragon's Lair",
    description: "The frozen domain of an ancient ice dragon",
    difficulty: 'C',
    enemyCount: 12,
    bossType: "Frost Wyrm",
    rewards: {
      experience: 800,
      gold: 2500,
      items: [
        { name: "Dragon Scale", rarity: "epic", chance: 0.6 },
        { name: "Ice Crystal Heart", rarity: "legendary", chance: 0.05 }
      ],
      shadowExtractions: [
        { name: "Shadow Ice Elemental", type: "mage", rarity: "epic" }
      ]
    },
    requirements: { minLevel: 25, maxShadows: 8 }
  }
];

export function DungeonRaidSystem({ 
  isVisible, 
  onClose, 
  playerLevel, 
  shadowArmy, 
  onShadowGain, 
  onExperienceGain 
}: DungeonRaidProps) {
  const [selectedFloor, setSelectedFloor] = useState<DungeonFloor | null>(null);
  const [selectedShadows, setSelectedShadows] = useState<string[]>([]);
  const [raidInProgress, setRaidInProgress] = useState(false);
  const [raidPhase, setRaidPhase] = useState<'preparation' | 'combat' | 'boss' | 'complete'>('preparation');
  const [currentWave, setCurrentWave] = useState(0);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [raidResults, setRaidResults] = useState<any>(null);

  const availableFloors = DUNGEON_FLOORS.filter(floor => 
    playerLevel >= floor.requirements.minLevel
  );

  const canSelectShadow = (shadowId: string) => {
    if (!selectedFloor) return false;
    if (selectedShadows.length >= selectedFloor.requirements.maxShadows) return false;
    return !selectedShadows.includes(shadowId);
  };

  const toggleShadowSelection = (shadowId: string) => {
    if (selectedShadows.includes(shadowId)) {
      setSelectedShadows(prev => prev.filter(id => id !== shadowId));
    } else if (canSelectShadow(shadowId)) {
      setSelectedShadows(prev => [...prev, shadowId]);
    }
  };

  const startRaid = async () => {
    if (!selectedFloor || selectedShadows.length === 0) return;
    
    setRaidInProgress(true);
    setRaidPhase('combat');
    setCurrentWave(1);
    setCombatLog([`Starting raid on ${selectedFloor.name}...`]);

    // Simulate combat waves
    for (let wave = 1; wave <= Math.ceil(selectedFloor.enemyCount / 3); wave++) {
      setCurrentWave(wave);
      await simulateWave(wave, selectedFloor);
      
      if (wave < Math.ceil(selectedFloor.enemyCount / 3)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Boss phase
    setRaidPhase('boss');
    setCombatLog(prev => [...prev, `${selectedFloor.bossType} appears!`]);
    await simulateBossFight(selectedFloor);

    // Calculate results
    const results = calculateRaidRewards(selectedFloor);
    setRaidResults(results);
    setRaidPhase('complete');
    
    // Apply rewards
    onExperienceGain(results.experience);
    results.shadowsExtracted.forEach(shadow => onShadowGain(shadow));
  };

  const simulateWave = async (wave: number, floor: DungeonFloor) => {
    const enemiesInWave = Math.min(3, floor.enemyCount - (wave - 1) * 3);
    
    setCombatLog(prev => [...prev, `Wave ${wave}: Engaging ${enemiesInWave} enemies`]);
    
    for (let i = 0; i < enemiesInWave; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const shadowUsed = selectedShadows[i % selectedShadows.length];
      const shadow = shadowArmy.find(s => s.id === shadowUsed);
      
      if (shadow) {
        setCombatLog(prev => [...prev, `${shadow.name} defeats enemy ${i + 1}`]);
      }
    }
    
    setCombatLog(prev => [...prev, `Wave ${wave} cleared!`]);
  };

  const simulateBossFight = async (floor: DungeonFloor) => {
    setCombatLog(prev => [...prev, `Boss battle begins!`]);
    
    // Simulate boss phases
    for (let phase = 1; phase <= 3; phase++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCombatLog(prev => [...prev, `Boss phase ${phase} - coordinated shadow attack!`]);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCombatLog(prev => [...prev, `${floor.bossType} defeated!`]);
  };

  const calculateRaidRewards = (floor: DungeonFloor) => {
    const baseRewards = floor.rewards;
    const shadowBonus = selectedShadows.length * 0.1;
    
    return {
      experience: Math.floor(baseRewards.experience * (1 + shadowBonus)),
      gold: Math.floor(baseRewards.gold * (1 + shadowBonus)),
      itemsObtained: baseRewards.items.filter(item => Math.random() < item.chance),
      shadowsExtracted: baseRewards.shadowExtractions
        .filter(() => Math.random() < 0.7)
        .map(extraction => generateShadowSoldier(extraction))
    };
  };

  const generateShadowSoldier = (extraction: any): ShadowSoldier => {
    return {
      id: `shadow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: extraction.name,
      level: Math.max(1, playerLevel - 5 + Math.floor(Math.random() * 10)),
      health: 100,
      maxHealth: 100,
      attack: 25 + Math.floor(Math.random() * 15),
      defense: 15 + Math.floor(Math.random() * 10),
      speed: 20 + Math.floor(Math.random() * 20),
      type: extraction.type,
      rarity: extraction.rarity,
      abilities: [
        {
          name: "Shadow Strike",
          damage: 30,
          manaCost: 10,
          cooldown: 3,
          description: "A quick shadow-enhanced attack"
        }
      ],
      experience: 0,
      maxExperience: 100
    };
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500';
      case 'epic': return 'text-purple-500';
      case 'rare': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'S': return 'bg-red-500';
      case 'A': return 'bg-orange-500';
      case 'B': return 'bg-yellow-500';
      case 'C': return 'bg-green-500';
      case 'D': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crown className="text-purple-400" />
                Dungeon Raid System
              </h2>
              <p className="text-gray-400">Deploy your shadow army to conquer challenging dungeons</p>
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>

          <Tabs defaultValue="floors" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="floors">Available Floors</TabsTrigger>
              <TabsTrigger value="preparation">Squad Preparation</TabsTrigger>
              <TabsTrigger value="combat">Combat Log</TabsTrigger>
            </TabsList>

            <TabsContent value="floors" className="space-y-4">
              <div className="grid gap-4">
                {availableFloors.map((floor) => (
                  <Card 
                    key={floor.level} 
                    className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
                      selectedFloor?.level === floor.level ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedFloor(floor)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            Floor {floor.level}: {floor.name}
                            <Badge className={getDifficultyColor(floor.difficulty)}>
                              Rank {floor.difficulty}
                            </Badge>
                          </CardTitle>
                          <p className="text-gray-400 text-sm">{floor.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Min Level: {floor.requirements.minLevel}</p>
                          <p className="text-sm text-gray-400">Max Shadows: {floor.requirements.maxShadows}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-white font-semibold mb-2">Enemies</h4>
                          <p className="text-gray-400">Count: {floor.enemyCount}</p>
                          <p className="text-gray-400">Boss: {floor.bossType}</p>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-2">Rewards</h4>
                          <p className="text-gray-400">EXP: {floor.rewards.experience}</p>
                          <p className="text-gray-400">Gold: {floor.rewards.gold}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="preparation" className="space-y-4">
              {selectedFloor ? (
                <>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Selected: {selectedFloor.name}</CardTitle>
                      <p className="text-gray-400">
                        Select up to {selectedFloor.requirements.maxShadows} shadow soldiers for this raid
                      </p>
                    </CardHeader>
                  </Card>

                  <div className="grid gap-3">
                    {shadowArmy.map((shadow) => (
                      <Card 
                        key={shadow.id}
                        className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
                          selectedShadows.includes(shadow.id) ? 'ring-2 ring-purple-500' : ''
                        } ${!canSelectShadow(shadow.id) && !selectedShadows.includes(shadow.id) ? 'opacity-50' : ''}`}
                        onClick={() => toggleShadowSelection(shadow.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className={`font-semibold ${getRarityColor(shadow.rarity)}`}>
                                {shadow.name}
                              </h4>
                              <p className="text-gray-400 text-sm">
                                Level {shadow.level} {shadow.type.charAt(0).toUpperCase() + shadow.type.slice(1)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">ATK: {shadow.attack}</p>
                              <p className="text-sm text-gray-400">DEF: {shadow.defense}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button 
                      onClick={startRaid}
                      disabled={selectedShadows.length === 0 || raidInProgress}
                      className="bg-purple-600 hover:bg-purple-700"
                      size="lg"
                    >
                      {raidInProgress ? 'Raid in Progress...' : 'Start Raid'}
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">Select a dungeon floor to begin preparation</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="combat" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sword className="text-red-400" />
                    Combat Log
                    {raidInProgress && (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                        Phase: {raidPhase} | Wave: {currentWave}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded p-4 h-64 overflow-y-auto font-mono text-sm">
                    {combatLog.map((log, index) => (
                      <div key={index} className="text-green-400 mb-1">
                        {log}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {raidResults && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Star className="text-yellow-400" />
                      Raid Complete!
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Rewards Gained</h4>
                        <p className="text-gray-400">Experience: +{raidResults.experience}</p>
                        <p className="text-gray-400">Gold: +{raidResults.gold}</p>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-2">New Shadows</h4>
                        {raidResults.shadowsExtracted.map((shadow: any, index: number) => (
                          <p key={index} className={`${getRarityColor(shadow.rarity)}`}>
                            {shadow.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}