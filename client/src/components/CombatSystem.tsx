import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sword, Shield, Zap, Eye, Heart, Skull } from "lucide-react";

interface CombatState {
  playerHealth: number;
  playerMaxHealth: number;
  playerMana: number;
  playerMaxMana: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  shadowSoldiers: Array<{
    id: string;
    name: string;
    health: number;
    maxHealth: number;
    attack: number;
    type: 'knight' | 'archer' | 'mage' | 'assassin';
  }>;
  extractableEnemies: Array<{
    id: string;
    name: string;
    extractionDifficulty: number;
    shadowType: 'knight' | 'archer' | 'mage' | 'assassin';
  }>;
  combatPhase: 'preparation' | 'combat' | 'extraction' | 'victory';
  activeSkills: string[];
}

interface ShadowExtractionProps {
  enemy: any;
  onSuccess: (shadowSoldier: any) => void;
  onFailure: () => void;
  playerLevel: number;
}

function ShadowExtractionMiniGame({ enemy, onSuccess, onFailure, playerLevel }: ShadowExtractionProps) {
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [shadowEnergy, setShadowEnergy] = useState(0);
  const [extractionPhase, setExtractionPhase] = useState<'gathering' | 'binding' | 'manifesting'>('gathering');
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate random target positions for shadow energy gathering
    const interval = setInterval(() => {
      setTargetPosition({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursorPosition({ x, y });

    // Check if cursor is near target
    const distance = Math.sqrt(
      Math.pow(x - targetPosition.x, 2) + Math.pow(y - targetPosition.y, 2)
    );

    if (distance < 5) {
      setShadowEnergy(prev => Math.min(100, prev + 2));
    }
  };

  const handleExtractionClick = () => {
    if (shadowEnergy >= 100) {
      setExtractionPhase('binding');
      setExtractionProgress(25);
      
      // Binding phase - rapid clicking
      let clicks = 0;
      const bindingInterval = setInterval(() => {
        clicks++;
        setExtractionProgress(25 + (clicks * 2));
        
        if (clicks >= 25) {
          clearInterval(bindingInterval);
          setExtractionPhase('manifesting');
          
          // Final manifestation
          setTimeout(() => {
            const success = Math.random() < (playerLevel / 200 + 0.3); // Higher level = better chance
            if (success) {
              const newShadowSoldier = {
                id: `shadow_${Date.now()}`,
                name: `Shadow ${enemy.name}`,
                health: Math.floor(enemy.maxHealth * 0.8),
                maxHealth: Math.floor(enemy.maxHealth * 0.8),
                attack: Math.floor(enemy.attack * 0.9),
                type: enemy.shadowType || 'knight'
              };
              onSuccess(newShadowSoldier);
            } else {
              onFailure();
            }
          }, 1000);
        }
      }, 100);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw shadow extraction visual effects
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw swirling shadows
    const time = Date.now() * 0.005;
    for (let i = 0; i < 10; i++) {
      const angle = time + (i * Math.PI * 2) / 10;
      const radius = 50 + Math.sin(time + i) * 20;
      const x = canvas.width / 2 + Math.cos(angle) * radius;
      const y = canvas.height / 2 + Math.sin(angle) * radius;
      
      ctx.fillStyle = `rgba(139, 69, 19, ${0.3 + Math.sin(time + i) * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw extraction energy
    if (shadowEnergy > 0) {
      ctx.fillStyle = `rgba(75, 0, 130, ${shadowEnergy / 100})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [shadowEnergy, extractionProgress]);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-gradient-to-b from-purple-900/90 to-black/90 border border-purple-500 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">
          Shadow Extraction
        </h3>
        
        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">
            Extract the shadow of: <span className="text-purple-400 font-semibold">{enemy.name}</span>
          </p>
          <div className="text-xs text-gray-400">
            Phase: <span className="text-purple-300 capitalize">{extractionPhase}</span>
          </div>
        </div>

        <div className="relative h-32 bg-black/50 border border-purple-500/30 rounded mb-4 overflow-hidden"
             onMouseMove={handleMouseMove}>
          <canvas 
            ref={canvasRef}
            width={300}
            height={128}
            className="absolute inset-0 w-full h-full"
          />
          
          {extractionPhase === 'gathering' && (
            <>
              <div 
                className="absolute w-4 h-4 bg-purple-500 rounded-full animate-pulse"
                style={{ 
                  left: `${targetPosition.x}%`, 
                  top: `${targetPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-purple-300 text-sm">
                Follow the shadow energy
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-purple-300">Shadow Energy</span>
              <span className="text-purple-300">{Math.floor(shadowEnergy)}%</span>
            </div>
            <Progress value={shadowEnergy} className="h-2 bg-gray-700">
              <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300" 
                   style={{ width: `${shadowEnergy}%` }} />
            </Progress>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-300">Extraction Progress</span>
              <span className="text-blue-300">{Math.floor(extractionProgress)}%</span>
            </div>
            <Progress value={extractionProgress} className="h-2 bg-gray-700">
              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all duration-300" 
                   style={{ width: `${extractionProgress}%` }} />
            </Progress>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button 
            onClick={handleExtractionClick}
            disabled={shadowEnergy < 100 || extractionPhase !== 'gathering'}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {extractionPhase === 'gathering' ? 'Begin Extraction' : 
             extractionPhase === 'binding' ? 'Binding...' : 'Manifesting...'}
          </Button>
          <Button 
            onClick={onFailure}
            variant="outline"
            className="border-gray-500 text-gray-300"
          >
            Cancel
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          Success Rate: {Math.floor(playerLevel / 200 * 100 + 30)}%
        </div>
      </div>
    </div>
  );
}

interface CombatSystemProps {
  isVisible: boolean;
  onCombatEnd: (result: 'victory' | 'defeat', rewards?: any) => void;
  playerLevel: number;
  playerStats: any;
  enemy: any;
}

export function CombatSystem({ isVisible, onCombatEnd, playerLevel, playerStats, enemy }: CombatSystemProps) {
  const [combatState, setCombatState] = useState<CombatState>({
    playerHealth: playerStats?.health || 1000,
    playerMaxHealth: playerStats?.maxHealth || 1000,
    playerMana: playerStats?.mana || 500,
    playerMaxMana: playerStats?.maxMana || 500,
    enemyHealth: enemy?.health || 800,
    enemyMaxHealth: enemy?.maxHealth || 800,
    shadowSoldiers: [],
    extractableEnemies: [],
    combatPhase: 'preparation',
    activeSkills: []
  });

  const [showExtraction, setShowExtraction] = useState(false);
  const [currentExtractionTarget, setCurrentExtractionTarget] = useState(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-4), message]);
  };

  const useSkill = (skillId: string) => {
    let damage = 0;
    let manaCost = 0;

    switch (skillId) {
      case 'shadow-extraction':
        // Attempt to extract defeated enemies
        if (combatState.enemyHealth <= 0) {
          setCurrentExtractionTarget(enemy);
          setShowExtraction(true);
          return;
        }
        addToCombatLog("Enemy must be defeated first!");
        break;

      case 'shadow-slash':
        damage = playerLevel * 15 + Math.random() * 100;
        manaCost = 30;
        addToCombatLog(`Shadow Slash deals ${Math.floor(damage)} damage!`);
        break;

      case 'stealth':
        manaCost = 25;
        addToCombatLog("Entered stealth mode!");
        setCombatState(prev => ({ 
          ...prev, 
          activeSkills: [...prev.activeSkills, 'stealth'],
          playerMana: prev.playerMana - manaCost
        }));
        return;

      case 'shadow-army':
        if (combatState.shadowSoldiers.length === 0) {
          addToCombatLog("No shadow soldiers available!");
          return;
        }
        damage = combatState.shadowSoldiers.reduce((total, soldier) => total + soldier.attack, 0);
        manaCost = 50;
        addToCombatLog(`Shadow Army attacks for ${Math.floor(damage)} damage!`);
        break;

      default:
        addToCombatLog("Unknown skill!");
        return;
    }

    // Apply damage and mana cost
    setCombatState(prev => ({
      ...prev,
      enemyHealth: Math.max(0, prev.enemyHealth - damage),
      playerMana: Math.max(0, prev.playerMana - manaCost)
    }));

    // Check for victory
    if (combatState.enemyHealth - damage <= 0) {
      setTimeout(() => {
        setCombatState(prev => ({ ...prev, combatPhase: 'extraction' }));
        addToCombatLog("Enemy defeated! Shadow extraction available!");
      }, 1000);
    } else {
      // Enemy counter-attack
      setTimeout(() => {
        const enemyDamage = Math.random() * 150 + 50;
        setCombatState(prev => ({
          ...prev,
          playerHealth: Math.max(0, prev.playerHealth - enemyDamage)
        }));
        addToCombatLog(`Enemy attacks for ${Math.floor(enemyDamage)} damage!`);
        
        // Check for defeat
        if (combatState.playerHealth - enemyDamage <= 0) {
          onCombatEnd('defeat');
        }
      }, 1500);
    }
  };

  const handleExtractionSuccess = (shadowSoldier: any) => {
    setCombatState(prev => ({
      ...prev,
      shadowSoldiers: [...prev.shadowSoldiers, shadowSoldier]
    }));
    addToCombatLog(`Successfully extracted ${shadowSoldier.name}!`);
    setShowExtraction(false);
    
    // End combat with victory
    const rewards = {
      experience: enemy.level * 50,
      gold: enemy.level * 25,
      shadowSoldier: shadowSoldier
    };
    onCombatEnd('victory', rewards);
  };

  const handleExtractionFailure = () => {
    addToCombatLog("Shadow extraction failed!");
    setShowExtraction(false);
    
    // Still end with victory, just no shadow soldier
    const rewards = {
      experience: enemy.level * 30,
      gold: enemy.level * 15
    };
    onCombatEnd('victory', rewards);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center">
        <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Player Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-300">Sung Jin-Woo</h3>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-300">Health</span>
                  <span className="text-red-300">{combatState.playerHealth}/{combatState.playerMaxHealth}</span>
                </div>
                <Progress value={(combatState.playerHealth / combatState.playerMaxHealth) * 100} className="h-3 bg-gray-700">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300" 
                       style={{ width: `${(combatState.playerHealth / combatState.playerMaxHealth) * 100}%` }} />
                </Progress>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-300">Mana</span>
                  <span className="text-blue-300">{combatState.playerMana}/{combatState.playerMaxMana}</span>
                </div>
                <Progress value={(combatState.playerMana / combatState.playerMaxMana) * 100} className="h-3 bg-gray-700">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300" 
                       style={{ width: `${(combatState.playerMana / combatState.playerMaxMana) * 100}%` }} />
                </Progress>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-purple-300">Skills</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => useSkill('shadow-slash')}
                    disabled={combatState.playerMana < 30}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Sword className="w-4 h-4 mr-1" />
                    Shadow Slash
                  </Button>
                  <Button 
                    onClick={() => useSkill('stealth')}
                    disabled={combatState.playerMana < 25}
                    size="sm"
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Stealth
                  </Button>
                  <Button 
                    onClick={() => useSkill('shadow-army')}
                    disabled={combatState.playerMana < 50 || combatState.shadowSoldiers.length === 0}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Skull className="w-4 h-4 mr-1" />
                    Shadow Army
                  </Button>
                  <Button 
                    onClick={() => useSkill('shadow-extraction')}
                    disabled={combatState.enemyHealth > 0}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Extract
                  </Button>
                </div>
              </div>

              {/* Shadow Soldiers */}
              {combatState.shadowSoldiers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-purple-300 mb-2">Shadow Army</h4>
                  {combatState.shadowSoldiers.map((soldier) => (
                    <div key={soldier.id} className="text-xs text-gray-300">
                      {soldier.name} - HP: {soldier.health}/{soldier.maxHealth}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Combat Area */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-bold text-red-300 mb-2">{enemy.name}</h3>
                <div className="relative h-32 bg-gradient-to-b from-red-900/20 to-black/50 border border-red-500/30 rounded-lg flex items-center justify-center">
                  <div className="text-6xl">{enemy.icon || '👹'}</div>
                  {combatState.activeSkills.includes('stealth') && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">Hidden in shadows...</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-red-300">Enemy Health</span>
                    <span className="text-red-300">{combatState.enemyHealth}/{combatState.enemyMaxHealth}</span>
                  </div>
                  <Progress value={(combatState.enemyHealth / combatState.enemyMaxHealth) * 100} className="h-3 bg-gray-700">
                    <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-300" 
                         style={{ width: `${(combatState.enemyHealth / combatState.enemyMaxHealth) * 100}%` }} />
                  </Progress>
                </div>
              </div>

              {/* Combat Log */}
              <div className="bg-black/50 border border-gray-600 rounded p-3 h-32 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Combat Log</h4>
                {combatLog.map((log, index) => (
                  <div key={index} className="text-xs text-gray-400 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Combat Controls */}
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="outline" className="text-purple-300">
                  Phase: {combatState.combatPhase}
                </Badge>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => onCombatEnd('defeat')}
                  variant="outline"
                  className="w-full border-gray-500 text-gray-300"
                >
                  Retreat
                </Button>
              </div>

              {combatState.combatPhase === 'extraction' && (
                <div className="text-center">
                  <p className="text-sm text-green-300 mb-2">
                    Victory! Shadow extraction available.
                  </p>
                  <Button 
                    onClick={() => {
                      setCurrentExtractionTarget(enemy);
                      setShowExtraction(true);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Extract Shadow
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showExtraction && currentExtractionTarget && (
        <ShadowExtractionMiniGame
          enemy={currentExtractionTarget}
          onSuccess={handleExtractionSuccess}
          onFailure={handleExtractionFailure}
          playerLevel={playerLevel}
        />
      )}
    </>
  );
}