import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sofa, MapPin, Coffee, TreePine, ChefHat, Eye, Heart, Shield, Users, Bed, Building, Zap } from 'lucide-react';

interface InteractiveNode {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  position: { x: number; y: number };
  thoughtPrompt: string;
  outcome: string;
  gameLogic: string;
  requirements?: string[];
  spatialRelationships?: {
    proximity?: string[]; // Other nodes that influence this one when nearby
    excludes?: string[]; // Nodes that cannot be active simultaneously
    enhances?: string[]; // Nodes that become more powerful when this is active
  };
  environmentalStates?: {
    weather?: string[]; // Weather conditions that affect this node
    timeOfDay?: string[]; // Times when this node is most active
    storyFlags?: string[]; // Story progress that modifies this node
  };
  memoryTriggers?: {
    firstTime?: string; // Special behavior on first interaction
    repeated?: string; // Different behavior on subsequent visits
    withCharacter?: string; // Special behavior when character is present
  };
}

interface LocationNodesProps {
  locationId: string;
  onNodeInteraction: (nodeId: string, thoughtPrompt: string, outcome: string) => void;
  playerStats: {
    affection: number;
    gold: number;
    apartmentTier: number;
  };
  environmentalContext?: {
    weather: string;
    timeOfDay: string;
    storyFlags: string[];
    visitHistory: Record<string, number>; // nodeId -> visit count
    chaHaeInPresent: boolean;
  };
}

const LOCATION_NODES: Record<string, InteractiveNode[]> = {
  // Player Apartment - Dynamic Based on Tier
  player_apartment: [
    // Tier 1 - Basic Apartment (4 nodes)
    {
      id: 'bedroom',
      label: 'Bedroom',
      icon: Bed,
      position: { x: 20, y: 30 },
      thoughtPrompt: 'Lead her to the bedroom',
      outcome: 'Intimate bedroom encounter',
      gameLogic: 'system_5_intimate_activity'
    },
    {
      id: 'couch_intimate',
      label: 'Living Room Couch',
      icon: Sofa,
      position: { x: 45, y: 60 },
      thoughtPrompt: 'Make love on the couch',
      outcome: 'Intimate living room encounter',
      gameLogic: 'system_5_intimate_activity'
    },
    {
      id: 'kitchen_counter',
      label: 'Kitchen Counter',
      icon: ChefHat,
      position: { x: 70, y: 40 },
      thoughtPrompt: 'Intimate kitchen encounter',
      outcome: 'Kitchen counter passion',
      gameLogic: 'system_5_intimate_activity'
    },
    {
      id: 'shower_room',
      label: 'Bathroom',
      icon: Shield,
      position: { x: 80, y: 25 },
      thoughtPrompt: 'Shower together',
      outcome: 'Steamy shower romance',
      gameLogic: 'system_5_intimate_activity'
    },
    // Tier 2 - Gangnam High-Rise (5 nodes) - Organized by zones
    // Private Quarters Zone
    {
      id: 'modern_bedroom',
      label: 'Master Bedroom',
      icon: Bed,
      position: { x: 20, y: 30 },
      thoughtPrompt: 'Stylish bedroom romance',
      outcome: 'Intimate moments in your upgraded bedroom',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_2']
    },
    {
      id: 'luxury_shower',
      label: 'Executive Bathroom',
      icon: Shield,
      position: { x: 20, y: 60 },
      thoughtPrompt: 'Steamy shower romance',
      outcome: 'Luxurious shower experience together',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_2']
    },
    // Social Zone
    {
      id: 'city_view_couch',
      label: 'Panoramic Lounge',
      icon: Sofa,
      position: { x: 50, y: 45 },
      thoughtPrompt: 'Intimate moments with city lights',
      outcome: 'Romance with stunning city views',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_2']
    },
    {
      id: 'designer_kitchen',
      label: 'Gourmet Kitchen',
      icon: ChefHat,
      position: { x: 80, y: 30 },
      thoughtPrompt: 'Kitchen counter passion',
      outcome: 'Intimate encounter in your designer kitchen',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_2']
    },
    // Outdoor Zone
    {
      id: 'rooftop_access',
      label: 'Private Terrace',
      icon: TreePine,
      position: { x: 80, y: 70 },
      thoughtPrompt: 'Garden terrace intimacy',
      outcome: 'Romance under the stars on your private rooftop',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_2']
    },
    // Tier 3 - Hannam-dong Penthouse (6 nodes)
    {
      id: 'master_bedroom',
      label: 'Master Suite',
      icon: Bed,
      position: { x: 20, y: 25 },
      thoughtPrompt: 'Private penthouse bedroom',
      outcome: 'Ultimate luxury bedroom experience',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'infinity_pool',
      label: 'Infinity Pool',
      icon: Shield,
      position: { x: 75, y: 30 },
      thoughtPrompt: 'Romantic pool encounter',
      outcome: 'Intimate moments in your private infinity pool',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'wine_cellar',
      label: 'Wine Cellar',
      icon: ChefHat,
      position: { x: 15, y: 65 },
      thoughtPrompt: 'Intimate wine tasting',
      outcome: 'Romance in your private wine collection',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'panoramic_balcony',
      label: 'City View Balcony',
      icon: Building,
      position: { x: 85, y: 50 },
      thoughtPrompt: 'Passionate balcony moments',
      outcome: 'Intimate encounter high above the city',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'luxury_bathroom',
      label: 'Marble Bathroom',
      icon: Shield,
      position: { x: 45, y: 70 },
      thoughtPrompt: 'Luxurious bath together',
      outcome: 'Spa-like intimate experience',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'private_elevator',
      label: 'Private Elevator',
      icon: Building,
      position: { x: 60, y: 80 },
      thoughtPrompt: 'Elevator intimacy',
      outcome: 'Private moments in your exclusive elevator',
      gameLogic: 'system_5_intimate_activity',
      requirements: ['apartment_tier_3']
    }
  ],

  // Gangnam District - Luxury Department Store
  luxury_department_store: [
    {
      id: 'jewelry_counter',
      label: 'Jewelry Counter',
      icon: ShoppingBag,
      position: { x: 20, y: 30 },
      thoughtPrompt: 'Browse the jewelry collection.',
      outcome: 'Opens the Item Inspection View displaying a featured necklace with cycling through all available jewelry gifts.',
      gameLogic: 'system_7_item_inspection'
    },
    {
      id: 'designer_apparel',
      label: 'Designer Apparel',
      icon: ShoppingBag,
      position: { x: 75, y: 25 },
      thoughtPrompt: 'Look at the designer clothing.',
      outcome: 'Opens the Item Inspection View for a featured designer dress with cycling through clothing gifts.',
      gameLogic: 'system_7_item_inspection'
    },
    {
      id: 'luxury_confections',
      label: 'Luxury Confections',
      icon: ShoppingBag,
      position: { x: 45, y: 75 },
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
      position: { x: 25, y: 35 },
      thoughtPrompt: 'Look at the sofas and tables.',
      outcome: 'Opens the Item Inspection View for featured sofa with cycling through living room furniture.',
      gameLogic: 'system_7_system_13_integration'
    },
    {
      id: 'bedroom_collection',
      label: 'Bedroom Collection',
      icon: Bed,
      position: { x: 75, y: 60 },
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
      position: { x: 30, y: 25 },
      thoughtPrompt: 'Speak with the realtor.',
      outcome: 'Initiates dialogue scene with Realtor NPC presenting available properties for sale.',
      gameLogic: 'npc_dialogue_realtor'
    },
    {
      id: 'architectural_models',
      label: 'Architectural Models',
      icon: Building,
      position: { x: 70, y: 70 },
      thoughtPrompt: 'Examine the property listings.',
      outcome: 'Opens special UI panel showing detailed Tier 2/3 apartment listing with exterior image and purchase option.',
      gameLogic: 'property_listing_ui'
    }
  ],

  // Hongdae District - Cafe
  hongdae_cafe: [
    {
      id: 'red_gate_entrance',
      label: 'Red Gate',
      icon: Shield,
      position: { x: 50, y: 40 },
      thoughtPrompt: 'Enter the Red Gate to clear the dungeon.',
      outcome: 'You approach the crimson portal that has materialized near Hongik University. The air crackles with dangerous energy.',
      gameLogic: 'dungeon_entrance',
      requirements: undefined,
      spatialRelationships: {
        enhances: undefined,
        excludes: ['counter', 'window_seat'],
        proximity: undefined
      },
      environmentalStates: {
        weather: ['clear', 'rain', 'cloudy'],
        timeOfDay: ['morning', 'afternoon', 'evening'],
        storyFlags: undefined
      },
      memoryTriggers: {
        firstTime: 'Enter the Red Gate - This is my mission',
        repeated: 'Enter the Red Gate - Time to finish what I started',
        withCharacter: 'Enter the Red Gate - Let\'s clear this together'
      }
    },
    {
      id: 'counter',
      label: 'Counter',
      icon: Coffee,
      position: { x: 80, y: 25 },
      thoughtPrompt: 'Order drinks for us.',
      outcome: 'You approach the counter to order beverages. Choosing her preferred drink correctly provides a bonus.',
      gameLogic: 'cafe_ordering_system',
      requirements: undefined,
      spatialRelationships: {
        enhances: ['window_seat'],
        excludes: undefined,
        proximity: undefined
      },
      environmentalStates: {
        weather: ['clear', 'rain', 'cloudy'],
        timeOfDay: ['morning', 'afternoon', 'evening'],
        storyFlags: undefined
      },
      memoryTriggers: {
        firstTime: 'Order drinks for us - I wonder what she prefers?',
        repeated: 'Order drinks for us - I remember her preference now',
        withCharacter: 'Order drinks for us - let\'s see if I can surprise her with her favorite'
      }
    },
    {
      id: 'window_seat',
      label: 'Window Seat',
      icon: Eye,
      position: { x: 20, y: 65 },
      thoughtPrompt: 'Suggest we take the window seat.',
      outcome: 'You both settle into comfortable seats with a peaceful view. This unlocks deeper conversation topics.',
      gameLogic: 'intimate_conversation_unlock',
      requirements: undefined,
      spatialRelationships: {
        enhances: undefined,
        excludes: undefined,
        proximity: ['counter']
      },
      environmentalStates: {
        weather: ['clear', 'rain', 'cloudy'],
        timeOfDay: ['morning', 'afternoon', 'evening'],
        storyFlags: undefined
      },
      memoryTriggers: {
        firstTime: 'Suggest we take the window seat - this feels like a perfect first date spot',
        repeated: 'Suggest we take the window seat - our favorite spot in the cafe',
        withCharacter: 'Suggest we take the window seat - somewhere we can talk privately'
      }
    },
    {
      id: 'red_gate_entrance',
      label: 'Red Gate',
      icon: Zap,
      position: { x: 85, y: 85 },
      thoughtPrompt: 'Enter the Red Gate',
      outcome: 'System 11: Touch-Based Combat dungeon raid experience begins',
      gameLogic: 'dungeon_raid_entrance',
      requirements: undefined,
      spatialRelationships: {
        enhances: undefined,
        excludes: ['counter', 'window_seat'],
        proximity: undefined
      },
      environmentalStates: {
        weather: ['clear', 'rain', 'cloudy'],
        timeOfDay: ['morning', 'afternoon', 'evening'],
        storyFlags: undefined
      },
      memoryTriggers: {
        firstTime: 'Enter the Red Gate - This is my mission',
        repeated: 'Enter the Red Gate - Time to finish what I started',
        withCharacter: 'Enter the Red Gate - Let\'s clear this together'
      }
    }
  ],

  // Hongdae District - Hangang Park
  hangang_park: [
    {
      id: 'park_bench',
      label: 'Park Bench',
      icon: TreePine,
      position: { x: 50, y: 45 },
      thoughtPrompt: 'Suggest we sit down for a while.',
      outcome: 'Multi-turn conversational scene. Text: *You both find a quiet bench, sitting side-by-side as you watch the river flow.* Cha Hae-In becomes more reflective and personal.',
      gameLogic: 'major_conversation_node_high_affection_memory_star'
    },
    {
      id: 'food_vendor_cart',
      label: 'Food Vendor Cart',
      icon: ChefHat,
      position: { x: 80, y: 20 },
      thoughtPrompt: 'Want to get some street food?',
      outcome: 'Panel: *You buy two skewers of tteokbokki. [ - ₩5,000 ]. You share the spicy rice cakes while watching the river. She laughs as you get some sauce on your face, wiping it away for you.*',
      gameLogic: 'small_gold_deduction_medium_affection_gain'
    },
    {
      id: 'rivers_edge',
      label: "River's Edge",
      icon: Eye,
      position: { x: 20, y: 75 },
      thoughtPrompt: "Let's get a closer look at the river.",
      outcome: 'Cinematic mode: UI fades away, camera pans across river to city skyline. Internal thought: *Looking at the calm river, it\'s easy to forget about the gates and the monsters... even for a moment.*',
      gameLogic: 'atmospheric_cinematic_no_cost_no_affection'
    }
  ],

  // Jung District - Restaurant
  myeongdong_restaurant: [
    {
      id: 'view_menu',
      label: 'View the Menu',
      icon: ChefHat,
      position: { x: 25, y: 35 },
      thoughtPrompt: 'Let\'s look at the menu.',
      outcome: 'Opens beautiful menu UI. Player and Cha Hae-In comment on dishes, leading to choice influencing dinner dialogue.',
      gameLogic: 'menu_ui_dialogue_influence'
    },
    {
      id: 'speak_sommelier',
      label: 'Speak with the Sommelier',
      icon: Users,
      position: { x: 75, y: 65 },
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
      position: { x: 50, y: 20 },
      thoughtPrompt: 'Let\'s look at the view.',
      outcome: 'UI fades for cinematic mode showing panoramic city view with romantic music and special conversation.',
      gameLogic: 'cinematic_mode_special_scene'
    },
    {
      id: 'wall_of_locks',
      label: 'The Wall of Locks',
      icon: Heart,
      position: { x: 30, y: 75 },
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



  // Personal Spaces - Cha Hae-In's Apartment
  chahaein_apartment: [
    {
      id: 'vanity_table',
      label: 'Vanity Table',
      icon: Eye,
      position: { x: 20, y: 25 },
      thoughtPrompt: 'Look at her personal items.',
      outcome: 'Observe Cha Hae-In\'s elegant makeup collection and personal accessories, gaining insight into her private life.',
      gameLogic: 'intimacy_insight_system_6'
    },
    {
      id: 'bookshelf',
      label: 'Bookshelf',
      icon: Building,
      position: { x: 80, y: 20 },
      thoughtPrompt: 'Browse her book collection.',
      outcome: 'Discover her reading preferences - hunter manuals, poetry, and romantic novels that reveal her softer side.',
      gameLogic: 'character_depth_system_6'
    },
    {
      id: 'bed',
      label: 'Bed',
      icon: Bed,
      position: { x: 50, y: 50 },
      thoughtPrompt: 'Notice the carefully made bed.',
      outcome: 'Admire her attention to detail and disciplined lifestyle. Unlocks deeper understanding of her character.',
      gameLogic: 'intimacy_progression_system_5'
    },
    {
      id: 'window_view',
      label: 'Window View',
      icon: Eye,
      position: { x: 80, y: 75 },
      thoughtPrompt: 'Look out her window.',
      outcome: 'Enjoy the view she wakes up to every morning - the Seoul skyline with hunter gates visible in distance.',
      gameLogic: 'atmospheric_immersion'
    },
    {
      id: 'tea_station',
      label: 'Tea Station',
      icon: Coffee,
      position: { x: 20, y: 80 },
      thoughtPrompt: 'Notice her tea collection.',
      outcome: 'Discover she enjoys traditional Korean teas. Option to prepare tea together for affection boost.',
      gameLogic: 'system_6_affection_activity'
    }
  ]
};

export function LocationInteractiveNodes({ 
  locationId, 
  onNodeInteraction, 
  playerStats, 
  environmentalContext 
}: LocationNodesProps) {
  const [selectedNode, setSelectedNode] = useState<InteractiveNode | null>(null);
  const [showThoughtPrompt, setShowThoughtPrompt] = useState(false);
  const [nearbyNodes, setNearbyNodes] = useState<string[]>([]);

  const baseNodes = LOCATION_NODES[locationId] || [];
  
  // System 3: Environmental State Management - Filter nodes based on context
  const getEnvironmentallyAvailableNodes = (): InteractiveNode[] => {
    if (!environmentalContext) return baseNodes;
    
    return baseNodes.filter(node => {
      // Weather-based availability
      if (node.environmentalStates?.weather && 
          !node.environmentalStates.weather.includes(environmentalContext.weather)) {
        return false;
      }
      
      // Time-based availability
      if (node.environmentalStates?.timeOfDay && 
          !node.environmentalStates.timeOfDay.includes(environmentalContext.timeOfDay)) {
        return false;
      }
      
      // Story flag requirements
      if (node.environmentalStates?.storyFlags && 
          !node.environmentalStates.storyFlags.some(flag => 
            environmentalContext.storyFlags.includes(flag))) {
        return false;
      }
      
      return true;
    });
  };

  const nodes = getEnvironmentallyAvailableNodes().filter((node, index, arr) => 
    arr.findIndex(n => n.id === node.id) === index
  ); // Remove duplicates

  // System 3: Spatial Relationship Calculator
  const calculateNodeProximity = (node1: InteractiveNode, node2: InteractiveNode): number => {
    const dx = node1.position.x - node2.position.x;
    const dy = node1.position.y - node2.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getNodeSpatialState = (node: InteractiveNode): {
    isEnhanced: boolean;
    isExcluded: boolean;
    proximityBonuses: string[];
  } => {
    let isEnhanced = false;
    let isExcluded = false;
    const proximityBonuses: string[] = [];

    // Check spatial relationships with other nodes
    if (node.spatialRelationships) {
      for (const otherNode of nodes) {
        if (otherNode.id === node.id) continue;
        
        const distance = calculateNodeProximity(node, otherNode);
        const isNearby = distance < 25; // Within 25% screen distance
        
        // Enhancement from nearby nodes
        if (isNearby && node.spatialRelationships.enhances?.includes(otherNode.id)) {
          isEnhanced = true;
          proximityBonuses.push(otherNode.id);
        }
        
        // Exclusion from conflicting nodes
        if (node.spatialRelationships.excludes?.includes(otherNode.id)) {
          isExcluded = true;
        }
      }
    }

    return { isEnhanced, isExcluded, proximityBonuses };
  };

  const getNodeMemoryState = (node: InteractiveNode): {
    thoughtPrompt: string;
    outcome: string;
    isFirstTime: boolean;
  } => {
    if (!environmentalContext?.visitHistory || !node.memoryTriggers) {
      return {
        thoughtPrompt: node.thoughtPrompt,
        outcome: node.outcome,
        isFirstTime: true
      };
    }

    const visitCount = environmentalContext.visitHistory[node.id] || 0;
    const isFirstTime = visitCount === 0;
    
    // Use memory-based prompts if available
    if (isFirstTime && node.memoryTriggers.firstTime) {
      return {
        thoughtPrompt: node.memoryTriggers.firstTime,
        outcome: node.outcome + " (First time experiencing this.)",
        isFirstTime: true
      };
    }
    
    if (!isFirstTime && node.memoryTriggers.repeated) {
      return {
        thoughtPrompt: node.memoryTriggers.repeated,
        outcome: node.outcome + " (Familiar place, new perspective.)",
        isFirstTime: false
      };
    }
    
    if (environmentalContext.chaHaeInPresent && node.memoryTriggers.withCharacter) {
      return {
        thoughtPrompt: node.memoryTriggers.withCharacter,
        outcome: node.outcome + " (Sharing this moment with Cha Hae-In.)",
        isFirstTime
      };
    }

    return {
      thoughtPrompt: node.thoughtPrompt,
      outcome: node.outcome,
      isFirstTime
    };
  };

  const handleNodeClick = (node: InteractiveNode) => {
    console.log('NODE CLICK DETECTED:', node.id);
    console.log('Node details:', node);
    
    // Red Gate bypasses ALL checks and goes directly to dungeon
    if (node.id === 'red_gate_entrance' || node.id === 'red_gate') {
      console.log('🚪 RED GATE NODE CLICKED - Direct execution path');
      console.log('Node details:', node);
      console.log('Red Gate - bypassing thought prompt, going directly to dungeon');
      const memoryState = getNodeMemoryState(node);
      console.log('Memory state:', memoryState);
      console.log('Calling onNodeInteraction with:', { 
        nodeId: node.id, 
        thoughtPrompt: memoryState.thoughtPrompt, 
        outcome: memoryState.outcome 
      });
      onNodeInteraction(node.id, memoryState.thoughtPrompt, memoryState.outcome);
      console.log('onNodeInteraction call completed');
      return;
    }

    // Check requirements for other nodes
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

    // Check spatial exclusions for other nodes
    const spatialState = getNodeSpatialState(node);
    if (spatialState.isExcluded) {
      return; // Node is blocked by conflicting nearby node
    }

    setSelectedNode(node);
    setShowThoughtPrompt(true);
  };

  const handleThoughtPromptClick = () => {
    if (selectedNode) {
      // Use memory-enhanced prompts and outcomes
      const memoryState = getNodeMemoryState(selectedNode);
      onNodeInteraction(selectedNode.id, memoryState.thoughtPrompt, memoryState.outcome);
      setShowThoughtPrompt(false);
      setSelectedNode(null);
    }
  };

  const isNodeAvailable = (node: InteractiveNode): boolean => {
    // Special handling for Red Gate - always available if story flag is set
    if (node.id === 'red_gate_entrance') {
      return true; // Always available for testing
    }
    
    if (!node.requirements) return true;

    return node.requirements.every(req => {
      if (req === 'apartment_tier_2') return playerStats.apartmentTier >= 2;
      if (req === 'apartment_tier_3') return playerStats.apartmentTier >= 3;
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
            className={`absolute pointer-events-auto cursor-pointer z-40 ${
              available ? 'opacity-100' : 'opacity-40'
            }`}
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🎯 NODE CLICKED:', node.id, 'Available:', available);
              if (available) {
                console.log('✅ Calling handleNodeClick for:', node.id);
                handleNodeClick(node);
              } else {
                console.log('❌ Node not available:', node.id);
              }
            }}
            whileHover={available ? { scale: 1.1 } : {}}
            whileTap={available ? { scale: 0.95 } : {}}
          >
            {/* Node Orb with 8px spacing system */}
            <motion.div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                available 
                  ? 'bg-purple-500 border-2 border-purple-300' 
                  : 'bg-gray-600 border-2 border-gray-400'
              }`}
              style={{
                minWidth: '24px',
                minHeight: '24px',
                padding: '4px', // 4px micro spacing for icon-to-border
                margin: '8px' // 8px standard element spacing
              }}
              animate={available ? {
                boxShadow: [
                  '0 0 5px rgba(147, 51, 234, 0.6)',
                  '0 0 15px rgba(147, 51, 234, 0.8)',
                  '0 0 5px rgba(147, 51, 234, 0.6)'
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <IconComponent className="w-3 h-3 text-white" />
            </motion.div>

            {/* Node Label with 8px spacing from orb */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <div className={`backdrop-blur-sm rounded-md text-sm border ${
                available 
                  ? 'bg-black/80 border-purple-400/50 text-purple-200'
                  : 'bg-black/60 border-gray-500/50 text-gray-400'
              }`}
              style={{
                padding: '4px 8px' // 4px micro spacing vertical, 8px standard horizontal
              }}>
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
              className="bg-black/80 backdrop-blur-xl border border-purple-400/30 rounded-2xl max-w-md mx-4"
              style={{ padding: '24px' }} // 24px container padding (3x unit)
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center"
                     style={{ marginBottom: '16px' }}> {/* 16px component spacing (2x unit) */}
                  <selectedNode.icon className="w-6 h-6 text-purple-400" />
                </div>

                <h3 className="text-white text-lg font-semibold"
                    style={{ marginBottom: '8px' }}> {/* 8px standard spacing */}
                  {selectedNode.label}
                </h3>

                <div className="text-purple-200 text-sm italic"
                     style={{ 
                       marginBottom: '24px', // 24px section spacing (3x unit)
                       padding: '8px 0' // 8px vertical padding
                     }}>
                  "{selectedNode.thoughtPrompt}"
                </div>

                <div className="flex"
                     style={{ gap: '8px' }}> {/* 8px gap between buttons */}
                  <Button
                    onClick={() => {
                      setShowThoughtPrompt(false);
                      setSelectedNode(null);
                    }}
                    variant="ghost"
                    className="flex-1 text-white/60 hover:bg-white/10"
                    style={{ padding: '8px 16px' }} // 8px vertical, 16px horizontal
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleThoughtPromptClick}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    style={{ padding: '8px 16px' }} // 8px vertical, 16px horizontal
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