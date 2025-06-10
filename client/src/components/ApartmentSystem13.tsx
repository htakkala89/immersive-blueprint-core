import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Home, 
  ArrowUp, 
  Star, 
  Sparkles, 
  Heart,
  ShoppingBag,
  Bed,
  Monitor,
  Eye,
  Camera,
  Trophy,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DecalItem {
  id: string;
  name: string;
  category: 'trophy' | 'memento' | 'luxury' | 'personal';
  icon: string;
  price: number;
  tier: number;
  affectionBonus: number;
  description: string;
  overlayImage?: string;
  unlockCondition?: string;
  position: { x: number; y: number };
  placed: boolean;
}

interface HomeTier {
  tier: number;
  name: string;
  description: string;
  upgradeCost: number;
  unlockCondition: string;
  interiorPrompt: string;
  exteriorPrompt: string;
  narrativeSignificance: string;
  interactiveNodes: Array<{
    id: string;
    position: { x: number; y: number };
    thoughtPrompt: string;
    action: string;
  }>;
}

interface ApartmentSystem13Props {
  isVisible: boolean;
  onClose: () => void;
  currentTier: number;
  currentGold: number;
  placedDecals: DecalItem[];
  onPurchaseProperty: (tier: number, cost: number) => void;
  onPlaceDecal: (decal: DecalItem) => void;
  onRemoveDecal: (decalId: string) => void;
  playerLevel: number;
  affectionLevel: number;
  storyProgress: number;
}

export function ApartmentSystem13({
  isVisible,
  onClose,
  currentTier,
  currentGold,
  placedDecals,
  onPurchaseProperty,
  onPlaceDecal,
  onRemoveDecal,
  playerLevel,
  affectionLevel,
  storyProgress
}: ApartmentSystem13Props) {
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [homeImage, setHomeImage] = useState<string | null>(null);
  const [showDecalShop, setShowDecalShop] = useState(false);

  const homeTiers: HomeTier[] = [
    {
      tier: 1,
      name: 'The Starter Apartment',
      description: 'Humble beginnings in a simple studio apartment',
      upgradeCost: 0,
      unlockCondition: 'Available by default',
      narrativeSignificance: 'Represents the humble, lonely beginnings of Sung Jin-Woo\'s journey. Functional but lacks warmth and personality.',
      interiorPrompt: 'masterpiece, best quality, sharp focus, manhwa art style, Korean webtoon aesthetic, clean lines, detailed architectural illustration, cinematic lighting, photorealistic details, the interior of a small, simple studio apartment in a nondescript area of Seoul. A single bed is against one wall. A small desk with a computer. A functional but basic kitchenette is visible. The lighting is from a single window, casting a stark late-afternoon light.',
      exteriorPrompt: 'masterpiece, best quality, sharp focus, manhwa art style, Korean webtoon aesthetic, clean lines, detailed architectural illustration, cinematic lighting, photorealistic details, the facade of a standard, slightly older apartment building in a normal residential district of Seoul. Mundane architecture, concrete and brick, view from the street level.',
      interactiveNodes: [
        {
          id: 'bed',
          position: { x: 25, y: 60 },
          thoughtPrompt: 'Rest for a while.',
          action: 'restore_energy'
        },
        {
          id: 'desk',
          position: { x: 70, y: 45 },
          thoughtPrompt: 'Check online hunter forums.',
          action: 'hunter_forums'
        }
      ]
    },
    {
      tier: 2,
      name: 'The Modern Gangnam High-Rise',
      description: 'Spacious modern apartment in prestigious Gangnam district',
      upgradeCost: 150000000,
      unlockCondition: 'Complete major story milestone (Jeju Island arc)',
      narrativeSignificance: 'The first major sign of success. A clean slate for building a proper life together with Cha Hae-In. It\'s a home, not just a place to sleep.',
      interiorPrompt: 'masterpiece, best quality, sharp focus, manhwa art style, Korean webtoon aesthetic, clean lines, detailed architectural illustration, cinematic lighting, photorealistic details, ultra-luxury penthouse interior in prestigious Gangnam district. Soaring 15-foot ceilings with dramatic floor-to-ceiling windows spanning entire walls revealing breathtaking Seoul skyline. Gleaming Carrara marble floors with gold veining. Opulent living area featuring oversized Italian leather sectional in rich charcoal, designer crystal chandelier casting warm ambient light. State-of-the-art gourmet kitchen with waterfall marble island, premium stainless steel appliances, and wine refrigerator. Sophisticated lighting design with recessed LEDs and accent lighting. Fresh orchids and premium artwork adorning surfaces. Luxurious textures of silk, cashmere, and polished metals throughout.',
      exteriorPrompt: 'masterpiece, best quality, sharp focus, manhwa art style, Korean webtoon aesthetic, clean lines, detailed architectural illustration, cinematic lighting, photorealistic details, ultra-premium luxury skyscraper tower in elite Gangnam district, Seoul. Soaring 60-story glass and titanium architectural masterpiece with distinctive curved facade. Premium materials including brushed platinum accents, tinted smart glass windows, and illuminated geometric patterns. Exclusive penthouse levels visible at the top with private terraces and infinity pools. Manicured landscaping at ground level with water features and sculptural elements. Golden hour lighting reflecting off pristine surfaces, creating dramatic shadows and highlights. Symbol of ultimate wealth and prestige in Seoul skyline.',
      interactiveNodes: [
        {
          id: 'sofa',
          position: { x: 40, y: 65 },
          thoughtPrompt: 'Relax on the new couch.',
          action: 'movie_together'
        },
        {
          id: 'window',
          position: { x: 75, y: 35 },
          thoughtPrompt: 'Look out at the city together.',
          action: 'city_view_conversation'
        }
      ]
    },
    {
      tier: 3,
      name: 'The Monarch\'s Penthouse',
      description: 'Ultimate luxury penthouse befitting the Shadow Monarch',
      upgradeCost: 500000000,
      unlockCondition: 'Achieve peak narrative status and immense fortune',
      narrativeSignificance: 'The endgame residence. A symbol of absolute power, wealth, and security. It is a sanctuary for the world\'s most powerful couple, high above everyone else.',
      interiorPrompt: 'masterpiece, best quality, sharp focus, manhwa art style, Korean webtoon aesthetic, clean lines, detailed architectural illustration, cinematic lighting, photorealistic details, the breathtaking, ultra-luxury interior of a massive penthouse suite at night, occupying the entire top floor of a skyscraper. Panoramic, floor-to-ceiling windows offer a 360-degree view of the glittering Seoul skyline far below. Opulent design with dark marble floors, soaring ceilings, and an infinity pool visible on the balcony. A collection of glowing magical artifacts are displayed in illuminated glass cases.',
      exteriorPrompt: 'masterpiece, best quality, sharp focus, manhwa art style, Korean webtoon aesthetic, clean lines, detailed architectural illustration, cinematic lighting, photorealistic details, an iconic landmark skyscraper at dusk, the absolute pinnacle of the Seoul skyline. Unique crystalline architecture. The very top penthouse suite is glowing with a faint, powerful purple mana energy.',
      interactiveNodes: [
        {
          id: 'artifacts',
          position: { x: 80, y: 50 },
          thoughtPrompt: 'Recall the battle.',
          action: 'memory_constellation'
        },
        {
          id: 'balcony',
          position: { x: 50, y: 25 },
          thoughtPrompt: 'Step out onto the balcony.',
          action: 'balcony_view'
        }
      ]
    }
  ];

  const availableDecals: DecalItem[] = [
    // Trophy Decals
    {
      id: 'jeju_raid_trophy',
      name: 'Jeju Island Victory Trophy',
      category: 'trophy',
      icon: '🏆',
      price: 10000000,
      tier: 2,
      affectionBonus: 8,
      description: 'Commemorates the successful Jeju Island raid',
      unlockCondition: 'Complete Jeju Island story arc',
      position: { x: 60, y: 30 },
      placed: false
    },
    {
      id: 'shadow_monarch_crown',
      name: 'Shadow Monarch Crown Display',
      category: 'trophy',
      icon: '👑',
      price: 50000000,
      tier: 3,
      affectionBonus: 20,
      description: 'Symbol of ultimate power and authority',
      unlockCondition: 'Achieve Shadow Monarch status',
      position: { x: 50, y: 20 },
      placed: false
    },
    
    // Memento Decals
    {
      id: 'first_date_photo',
      name: 'First Date Photo Frame',
      category: 'memento',
      icon: '📸',
      price: 5000000,
      tier: 1,
      affectionBonus: 10,
      description: 'A framed photo from your first date with Cha Hae-In',
      unlockCondition: 'Complete first romantic date',
      position: { x: 70, y: 50 },
      placed: false
    },
    {
      id: 'couples_ring_display',
      name: 'Promise Ring Display',
      category: 'memento',
      icon: '💍',
      price: 25000000,
      tier: 2,
      affectionBonus: 15,
      description: 'Display case for your matching promise rings',
      unlockCondition: 'Reach 80% affection with Cha Hae-In',
      position: { x: 40, y: 60 },
      placed: false
    },
    
    // Luxury Decals
    {
      id: 'crystal_chandelier',
      name: 'Crystal Chandelier',
      category: 'luxury',
      icon: '✨',
      price: 30000000,
      tier: 3,
      affectionBonus: 12,
      description: 'Elegant lighting fixture that adds sophisticated ambiance',
      position: { x: 50, y: 15 },
      placed: false
    },
    {
      id: 'wine_collection',
      name: 'Premium Wine Collection',
      category: 'luxury',
      icon: '🍷',
      price: 15000000,
      tier: 2,
      affectionBonus: 8,
      description: 'Curated selection of fine wines for special occasions',
      position: { x: 80, y: 60 },
      placed: false
    },
    
    // Personal Decals
    {
      id: 'cha_haein_portrait',
      name: 'Cha Hae-In Portrait',
      category: 'personal',
      icon: '🎨',
      price: 20000000,
      tier: 2,
      affectionBonus: 18,
      description: 'Beautiful commissioned portrait of Cha Hae-In',
      unlockCondition: 'Reach 70% affection with Cha Hae-In',
      position: { x: 30, y: 40 },
      placed: false
    }
  ];

  const currentHome = homeTiers.find(tier => tier.tier === currentTier) || homeTiers[0];
  const nextTier = homeTiers.find(tier => tier.tier === currentTier + 1);

  const canUpgrade = () => {
    if (!nextTier) return false;
    if (currentGold < nextTier.upgradeCost) return false;
    
    switch (nextTier.tier) {
      case 2: return storyProgress >= 5; // Jeju Island arc completion
      case 3: return storyProgress >= 10 && affectionLevel >= 80; // Peak status
      default: return false;
    }
  };

  const getTotalAffectionBonus = () => {
    return placedDecals.reduce((total: number, item: DecalItem) => total + item.affectionBonus, 0);
  };

  const fetchHomeImage = async () => {
    try {
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          location: 'player_apartment',
          timeOfDay: 'evening',
          tier: currentTier,
          prompt: currentHome.interiorPrompt
        })
      });
      const data = await response.json();
      if (data.imageUrl) {
        setHomeImage(data.imageUrl);
      }
    } catch (error) {
      console.log('Failed to load home image');
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchHomeImage();
    }
  }, [isVisible, currentTier]);

  const handleNodeInteraction = (nodeId: string) => {
    const node = currentHome.interactiveNodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setSelectedNode(nodeId);
    
    // Handle different node actions
    switch (node.action) {
      case 'restore_energy':
        // Trigger energy restoration
        console.log('Restoring energy...');
        break;
      case 'hunter_forums':
        // Open hunter forums panel
        console.log('Opening hunter forums...');
        break;
      case 'movie_together':
        // Trigger movie watching activity
        console.log('Starting movie together...');
        break;
      case 'city_view_conversation':
        // Trigger dialogue with Cha Hae-In
        console.log('Starting city view conversation...');
        break;
      case 'memory_constellation':
        // Open memory constellation
        console.log('Opening memory constellation...');
        break;
      case 'balcony_view':
        // Transition to balcony view
        console.log('Moving to balcony...');
        break;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-6xl h-full max-h-[90vh] bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Home className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-white text-xl font-bold">{currentHome.name}</h2>
                <p className="text-white/60 text-sm">{currentHome.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white/60 text-sm">Comfort Bonus</div>
                <div className="text-pink-400 font-semibold">+{getTotalAffectionBonus()}% Affection</div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-white/60 hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Home Interior View */}
            <div className="flex-1 flex flex-col">
              {/* Home Interior with Interactive Nodes */}
              <div 
                className="flex-1 relative overflow-hidden"
                style={{
                  backgroundImage: homeImage ? `url(${homeImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!homeImage && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black/80 to-black flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl"
                    >
                      🏠
                    </motion.div>
                  </div>
                )}

                {/* Overlay for better visibility */}
                <div className="absolute inset-0 bg-black/20" />

                {/* Interactive Nodes */}
                {currentHome.interactiveNodes.map((node) => (
                  <motion.div
                    key={node.id}
                    className="absolute cursor-pointer group"
                    style={{
                      left: `${node.position.x}%`,
                      top: `${node.position.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNodeInteraction(node.id)}
                  >
                    <div className="relative">
                      <motion.div
                        className="w-12 h-12 bg-purple-500/30 backdrop-blur-sm rounded-full border-2 border-purple-400/60 flex items-center justify-center"
                        animate={{ 
                          boxShadow: [
                            '0 0 10px rgba(147, 51, 234, 0.6)',
                            '0 0 20px rgba(147, 51, 234, 0.8)',
                            '0 0 10px rgba(147, 51, 234, 0.6)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {node.id === 'bed' && <Bed className="w-6 h-6 text-white" />}
                        {node.id === 'desk' && <Monitor className="w-6 h-6 text-white" />}
                        {node.id === 'sofa' && <Home className="w-6 h-6 text-white" />}
                        {node.id === 'window' && <Eye className="w-6 h-6 text-white" />}
                        {node.id === 'artifacts' && <Trophy className="w-6 h-6 text-white" />}
                        {node.id === 'balcony' && <Star className="w-6 h-6 text-white" />}
                      </motion.div>
                      
                      {/* Tooltip */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded text-white text-sm whitespace-nowrap border border-white/20">
                          {node.thoughtPrompt}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Placed Decals */}
                {placedDecals.map((decal) => (
                  <motion.div
                    key={decal.id}
                    className="absolute cursor-pointer group"
                    style={{
                      left: `${decal.position.x}%`,
                      top: `${decal.position.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDecal(decal.id);
                    }}
                  >
                    <div className="relative">
                      <div className="text-3xl filter drop-shadow-lg">{decal.icon}</div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-white text-xs whitespace-nowrap">
                          {decal.name} (+{decal.affectionBonus}%)
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Controls */}
              <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-center justify-between">
                  <div className="text-white/60 text-sm">
                    Decals: {placedDecals.length} • Narrative Significance: {currentHome.narrativeSignificance.slice(0, 60)}...
                  </div>
                  {nextTier && (
                    <Button
                      onClick={() => setShowPropertyModal(true)}
                      disabled={!canUpgrade()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Upgrade Property
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Decal Shop */}
            <div className="w-80 bg-black/30 backdrop-blur-sm border-l border-white/10 flex flex-col">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Personal Items
                </h3>
                <p className="text-white/60 text-xs mt-1">Trophies, mementos, and luxury items</p>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {availableDecals
                  .filter(decal => decal.tier <= currentTier)
                  .map((decal) => {
                    const isPlaced = placedDecals.some(p => p.id === decal.id);
                    const canAfford = currentGold >= decal.price;
                    const meetsCondition = !decal.unlockCondition || 
                      (decal.unlockCondition.includes('70%') && affectionLevel >= 70) ||
                      (decal.unlockCondition.includes('80%') && affectionLevel >= 80) ||
                      (decal.unlockCondition.includes('Jeju') && storyProgress >= 5) ||
                      (decal.unlockCondition.includes('Shadow Monarch') && storyProgress >= 10);

                    return (
                      <motion.div
                        key={decal.id}
                        whileHover={{ scale: 1.02 }}
                        className={`bg-white/5 rounded-xl p-4 border transition-all cursor-pointer ${
                          isPlaced ? 'border-green-400/50 bg-green-400/10' :
                          !canAfford || !meetsCondition ? 'border-red-400/50 opacity-60' :
                          'border-white/10 hover:bg-white/10'
                        }`}
                        onClick={() => {
                          if (!isPlaced && canAfford && meetsCondition) {
                            onPlaceDecal(decal);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{decal.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-sm">{decal.name}</h4>
                            <p className="text-white/60 text-xs mb-2">{decal.description}</p>
                            
                            {decal.unlockCondition && !meetsCondition && (
                              <p className="text-red-400 text-xs mb-2">Requires: {decal.unlockCondition}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="text-yellow-400 text-xs font-medium">
                                ₩{decal.price.toLocaleString()}
                              </div>
                              <div className="text-pink-400 text-xs">
                                +{decal.affectionBonus}% Affection
                              </div>
                            </div>
                            {isPlaced && (
                              <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                Placed
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Property Upgrade Modal */}
        <AnimatePresence>
          {showPropertyModal && nextTier && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
              onClick={() => setShowPropertyModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Property Upgrade
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-white font-medium">{nextTier.name}</h4>
                    <p className="text-white/60 text-sm">{nextTier.description}</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-white/60 text-sm mb-2">Narrative Significance:</div>
                    <p className="text-white text-sm">{nextTier.narrativeSignificance}</p>
                  </div>

                  <div className="text-yellow-400 font-semibold">
                    Cost: ₩{nextTier.upgradeCost.toLocaleString()}
                  </div>

                  {!canUpgrade() && (
                    <div className="text-red-400 text-sm">
                      Requirements: {nextTier.unlockCondition}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowPropertyModal(false)}
                    variant="ghost"
                    className="flex-1 text-white/60 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onPurchaseProperty(nextTier.tier, nextTier.upgradeCost);
                      setShowPropertyModal(false);
                    }}
                    disabled={!canUpgrade()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                  >
                    Purchase
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}