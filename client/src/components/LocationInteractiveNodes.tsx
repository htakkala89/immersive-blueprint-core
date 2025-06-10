import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sofa, MapPin, Coffee, TreePine, ChefHat, Eye, Heart, Shield, Users, Bed, Building } from 'lucide-react';

interface InteractiveNode {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  position: { x: number; y: number };
  thoughtPrompt: string;
  outcome: string;
  gameLogic: string;
  requirements?: string[];
}

interface LocationNodesProps {
  locationId: string;
  onNodeInteraction: (nodeId: string, thoughtPrompt: string, outcome: string) => void;
  playerStats: {
    affection: number;
    gold: number;
    apartmentTier: number;
  };
}

const LOCATION_NODES: Record<string, InteractiveNode[]> = {
  // Gangnam District - Luxury Department Store
  luxury_department_store: [
    {
      id: 'jewelry_counter',
      label: 'Jewelry Counter',
      icon: ShoppingBag,
      position: { x: 25, y: 40 },
      thoughtPrompt: 'Browse the jewelry collection.',
      outcome: 'Opens the Item Inspection View displaying a featured necklace with cycling through all available jewelry gifts.',
      gameLogic: 'system_7_item_inspection'
    },
    {
      id: 'designer_apparel',
      label: 'Designer Apparel',
      icon: ShoppingBag,
      position: { x: 65, y: 35 },
      thoughtPrompt: 'Look at the designer clothing.',
      outcome: 'Opens the Item Inspection View for a featured designer dress with cycling through clothing gifts.',
      gameLogic: 'system_7_item_inspection'
    },
    {
      id: 'luxury_confections',
      label: 'Luxury Confections',
      icon: ShoppingBag,
      position: { x: 45, y: 65 },
      thoughtPrompt: 'See the artisan chocolates.',
      outcome: 'Opens the Item Inspection View for premium chocolate box with cycling through confectionary gifts.',
      gameLogic: 'system_7_item_inspection'
    }
  ],

  // Gangnam District - Furnishings
  gangnam_furnishings: [
    {
      id: 'living_room_collection',
      label: 'Living Room Collection',
      icon: Sofa,
      position: { x: 30, y: 45 },
      thoughtPrompt: 'Look at the sofas and tables.',
      outcome: 'Opens the Item Inspection View for featured sofa with cycling through living room furniture.',
      gameLogic: 'system_7_system_13_integration'
    },
    {
      id: 'bedroom_collection',
      label: 'Bedroom Collection',
      icon: Bed,
      position: { x: 70, y: 50 },
      thoughtPrompt: 'Browse the bedroom sets.',
      outcome: 'Opens the Item Inspection View for featured bed frame with cycling through bedroom furniture.',
      gameLogic: 'system_7_system_13_integration'
    }
  ],

  // Gangnam District - Luxury Realtor
  luxury_realtor: [
    {
      id: 'reception_desk',
      label: 'Reception Desk',
      icon: Users,
      position: { x: 40, y: 35 },
      thoughtPrompt: 'Speak with the realtor.',
      outcome: 'Initiates dialogue scene with Realtor NPC presenting available properties for sale.',
      gameLogic: 'npc_dialogue_realtor'
    },
    {
      id: 'architectural_models',
      label: 'Architectural Models',
      icon: Building,
      position: { x: 60, y: 60 },
      thoughtPrompt: 'Examine the property listings.',
      outcome: 'Opens special UI panel showing detailed Tier 2/3 apartment listing with exterior image and purchase option.',
      gameLogic: 'property_listing_ui'
    }
  ],

  // Hongdae District - Cafe
  hongdae_cafe: [
    {
      id: 'counter',
      label: 'Counter',
      icon: Coffee,
      position: { x: 30, y: 40 },
      thoughtPrompt: 'Order drinks for us.',
      outcome: 'Initiates dialogue choice asking Cha Hae-In her preference. Correct choice grants affection boost.',
      gameLogic: 'system_6_affection_boost'
    },
    {
      id: 'window_seat',
      label: 'Window Seat',
      icon: Eye,
      position: { x: 75, y: 25 },
      thoughtPrompt: 'Suggest we take the window seat.',
      outcome: 'Text: *You both settle into comfortable seats, watching the city go by.* Unlocks unique conversation topics.',
      gameLogic: 'conversation_context_unlock'
    }
  ],

  // Hongdae District - Hangang Park
  hangang_park: [
    {
      id: 'park_bench',
      label: 'Park Bench',
      icon: TreePine,
      position: { x: 40, y: 60 },
      thoughtPrompt: 'Suggest sitting for a while.',
      outcome: 'Triggers unique heartfelt conversational scene about relaxing and their journey together.',
      gameLogic: 'special_conversation_branch'
    },
    {
      id: 'food_vendor_cart',
      label: 'Food Vendor Cart',
      icon: ChefHat,
      position: { x: 70, y: 35 },
      thoughtPrompt: 'Want to get some street food?',
      outcome: 'Scene where they buy and share food. Costs small Gold amount, grants small affection boost.',
      gameLogic: 'system_14_system_6_transaction'
    }
  ],

  // Jung District - Restaurant
  myeongdong_restaurant: [
    {
      id: 'view_menu',
      label: 'View the Menu',
      icon: ChefHat,
      position: { x: 35, y: 45 },
      thoughtPrompt: 'Let\'s look at the menu.',
      outcome: 'Opens beautiful menu UI. Player and Cha Hae-In comment on dishes, leading to choice influencing dinner dialogue.',
      gameLogic: 'menu_ui_dialogue_influence'
    },
    {
      id: 'speak_sommelier',
      label: 'Speak with the Sommelier',
      icon: Users,
      position: { x: 65, y: 30 },
      thoughtPrompt: 'Ask the sommelier for a recommendation.',
      outcome: 'Short dialogue with NPC recommending wine. Ordering costs Gold but provides larger affection boost.',
      gameLogic: 'npc_dialogue_system_14_system_6'
    }
  ],

  // Jung District - N Seoul Tower
  namsan_tower: [
    {
      id: 'observation_deck',
      label: 'Observation Deck',
      icon: Eye,
      position: { x: 50, y: 30 },
      thoughtPrompt: 'Let\'s look at the view.',
      outcome: 'UI fades for cinematic mode showing panoramic city view with romantic music and special conversation.',
      gameLogic: 'cinematic_mode_special_scene'
    },
    {
      id: 'wall_of_locks',
      label: 'The Wall of Locks',
      icon: Heart,
      position: { x: 40, y: 70 },
      thoughtPrompt: 'Should we add our own lock?',
      outcome: 'Key relationship scene. With Padlock item, add lock together creating unique high-value Memory Star.',
      gameLogic: 'system_6_memory_star_creation',
      requirements: ['padlock_item']
    }
  ],

  // Yeongdeungpo - Hunter Association
  hunter_association: [
    {
      id: 'mission_board',
      label: 'Mission Board',
      icon: MapPin,
      position: { x: 25, y: 35 },
      thoughtPrompt: 'Check the board for new gate alerts.',
      outcome: 'Opens read-only UI panel listing high-rank gates around the world for lore and world-building.',
      gameLogic: 'lore_panel_display'
    },
    {
      id: 'receptionist',
      label: 'Receptionist',
      icon: Users,
      position: { x: 65, y: 45 },
      thoughtPrompt: 'Ask the receptionist for any rumors.',
      outcome: 'Brief dialogue with Guild employee NPC providing rotating gameplay hint or rumor.',
      gameLogic: 'npc_dialogue_hints'
    },
    {
      id: 'elevator_bank',
      label: 'Elevator Bank',
      icon: Building,
      position: { x: 45, y: 70 },
      thoughtPrompt: 'Take the elevator to upper floors.',
      outcome: 'Provides access to restricted Hunter Association floors with advanced facilities.',
      gameLogic: 'floor_navigation_system'
    }
  ],

  // Yeongdeungpo - Training Facility
  training_facility: [
    {
      id: 'sparring_ring',
      label: 'Sparring Ring',
      icon: Shield,
      position: { x: 40, y: 35 },
      thoughtPrompt: 'Challenge Hae-In to a light spar.',
      outcome: 'Acts as shortcut to initiate Sparring Session activity from Daily Life Hub if conditions are met.',
      gameLogic: 'system_4_sparring_shortcut'
    },
    {
      id: 'combat_analytics',
      label: 'Combat Analytics Monitor',
      icon: Eye,
      position: { x: 70, y: 50 },
      thoughtPrompt: 'Review our last raid.',
      outcome: 'Opens UI panel with stylized stats from last completed dungeon. Triggers Review Raid Footage buff.',
      gameLogic: 'raid_stats_ui_buff'
    },
    {
      id: 'equipment_rack',
      label: 'Equipment Rack',
      icon: Shield,
      position: { x: 25, y: 65 },
      thoughtPrompt: 'Check the training equipment.',
      outcome: 'Inspects available training gear and weapons for skill enhancement sessions.',
      gameLogic: 'equipment_inspection_training'
    }
  ],

  // Personal Spaces - Player Apartment
  player_apartment: [
    {
      id: 'bed',
      label: 'Bed',
      icon: Bed,
      position: { x: 60, y: 50 },
      thoughtPrompt: 'Rest for a while.',
      outcome: 'Triggers restore energy function. Time advances, energy refilled, location lighting updates.',
      gameLogic: 'energy_restore_time_advance'
    },
    {
      id: 'balcony',
      label: 'Balcony',
      icon: Building,
      position: { x: 80, y: 25 },
      thoughtPrompt: 'Step out onto the balcony.',
      outcome: 'Transitions to unique Balcony Spatial View with own nodes and different conversation topics.',
      gameLogic: 'spatial_view_transition',
      requirements: ['apartment_tier_2']
    }
  ],

  // Personal Spaces - Cha Hae-In's Apartment
  chahaein_apartment: [
    {
      id: 'bed',
      label: 'Bed',
      icon: Bed,
      position: { x: 40, y: 60 },
      thoughtPrompt: 'Rest for a while.',
      outcome: 'Triggers restore energy function. Time advances, energy refilled, location lighting updates.',
      gameLogic: 'energy_restore_time_advance'
    },
    {
      id: 'balcony',
      label: 'Balcony',
      icon: Building,
      position: { x: 75, y: 30 },
      thoughtPrompt: 'Step out onto the balcony.',
      outcome: 'Transitions to unique Balcony Spatial View with own nodes and different conversation topics.',
      gameLogic: 'spatial_view_transition',
      requirements: ['apartment_tier_2']
    }
  ]
};

export function LocationInteractiveNodes({ locationId, onNodeInteraction, playerStats }: LocationNodesProps) {
  const [selectedNode, setSelectedNode] = useState<InteractiveNode | null>(null);
  const [showThoughtPrompt, setShowThoughtPrompt] = useState(false);

  const nodes = LOCATION_NODES[locationId] || [];

  const handleNodeClick = (node: InteractiveNode) => {
    // Check requirements
    if (node.requirements) {
      for (const req of node.requirements) {
        if (req === 'apartment_tier_2' && playerStats.apartmentTier < 2) {
          return; // Node not available
        }
        if (req === 'padlock_item') {
          // Check inventory for padlock - simplified for now
          // This would connect to actual inventory system
        }
      }
    }

    setSelectedNode(node);
    setShowThoughtPrompt(true);
  };

  const handleThoughtPromptClick = () => {
    if (selectedNode) {
      onNodeInteraction(selectedNode.id, selectedNode.thoughtPrompt, selectedNode.outcome);
      setShowThoughtPrompt(false);
      setSelectedNode(null);
    }
  };

  const isNodeAvailable = (node: InteractiveNode): boolean => {
    if (!node.requirements) return true;

    return node.requirements.every(req => {
      if (req === 'apartment_tier_2') return playerStats.apartmentTier >= 2;
      if (req === 'padlock_item') return true; // Simplified - would check inventory
      return true;
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Interactive Nodes */}
      {nodes.map((node) => {
        const available = isNodeAvailable(node);
        const IconComponent = node.icon;

        return (
          <motion.div
            key={node.id}
            className={`absolute pointer-events-auto cursor-pointer ${
              available ? 'opacity-100' : 'opacity-40'
            }`}
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => available && handleNodeClick(node)}
            whileHover={available ? { scale: 1.1 } : {}}
            whileTap={available ? { scale: 0.95 } : {}}
          >
            {/* Node Orb */}
            <motion.div
              className={`w-4 h-4 rounded-full flex items-center justify-center ${
                available 
                  ? 'bg-purple-500 border-2 border-purple-300' 
                  : 'bg-gray-600 border-2 border-gray-400'
              }`}
              animate={available ? {
                boxShadow: [
                  '0 0 5px rgba(147, 51, 234, 0.6)',
                  '0 0 15px rgba(147, 51, 234, 0.8)',
                  '0 0 5px rgba(147, 51, 234, 0.6)'
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <IconComponent className="w-2 h-2 text-white" />
            </motion.div>

            {/* Node Label */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className={`backdrop-blur-sm px-2 py-1 rounded text-xs border ${
                available 
                  ? 'bg-black/80 border-purple-400/50 text-purple-200'
                  : 'bg-black/60 border-gray-500/50 text-gray-400'
              }`}>
                {node.label}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Thought Prompt Modal */}
      <AnimatePresence>
        {showThoughtPrompt && selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto"
            onClick={() => {
              setShowThoughtPrompt(false);
              setSelectedNode(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/80 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
                  <selectedNode.icon className="w-6 h-6 text-purple-400" />
                </div>

                <h3 className="text-white text-lg font-semibold">
                  {selectedNode.label}
                </h3>

                <div className="text-purple-200 text-sm italic">
                  "{selectedNode.thoughtPrompt}"
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowThoughtPrompt(false);
                      setSelectedNode(null);
                    }}
                    variant="ghost"
                    className="flex-1 text-white/60 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleThoughtPromptClick}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Act on Thought
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}