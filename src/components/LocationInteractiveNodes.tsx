import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sofa, MapPin, Coffee, TreePine, ChefHat, Eye, Heart, Shield, Users, Bed, Building, Zap, Monitor } from 'lucide-react';

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
      id: 'bed',
      label: 'Bed',
      icon: Bed,
      position: { x: 10, y: 10 },
      thoughtPrompt: 'Suggest it\'s time to head to the bedroom',
      outcome: 'Direct gateway to highest-tier unlocked intimate activity',
      gameLogic: 'intimate_gateway_direct',
      requirements: ['apartment_tier_1']
    },
    {
      id: 'living_room_couch',
      label: 'Living Room Couch',
      icon: Sofa,
      position: { x: 50, y: 90 },
      thoughtPrompt: 'Suggest relaxing on the sofa',
      outcome: 'Relaxing scene that can lead to cuddling activity',
      gameLogic: 'couch_relaxation_gateway',
      requirements: ['apartment_tier_1']
    },
    {
      id: 'kitchen_counter',
      label: 'Kitchen Counter',
      icon: ChefHat,
      position: { x: 90, y: 50 },
      thoughtPrompt: 'Intimate kitchen encounter',
      outcome: 'Kitchen counter passion',
      gameLogic: 'intimate_activity_direct',
      requirements: ['apartment_tier_1']
    },
    {
      id: 'shower',
      label: 'Shower',
      icon: Shield,
      position: { x: 90, y: 10 },
      thoughtPrompt: 'Shower together',
      outcome: 'Steamy shower romance',
      gameLogic: 'intimate_activity_direct',
      requirements: ['apartment_tier_1']
    },
    // Tier 2 - Gangnam High-Rise (4 nodes) - Gateway approach
    {
      id: 'living_room_couch',
      label: 'Living Room Couch',
      icon: Sofa,
      position: { x: 10, y: 90 },
      thoughtPrompt: 'Suggest relaxing together on the couch',
      outcome: 'Creates a comfortable, intimate atmosphere. New activities become available in your Day Planner.',
      gameLogic: 'narrative_gateway_unlock',
      requirements: ['apartment_tier_2']
    },
    {
      id: 'modern_kitchen',
      label: 'Modern Kitchen',
      icon: ChefHat,
      position: { x: 90, y: 10 },
      thoughtPrompt: 'Suggest we try cooking something',
      outcome: 'An intimate cooking moment develops. New romantic activities unlock in your Day Planner.',
      gameLogic: 'narrative_gateway_unlock',
      requirements: ['apartment_tier_2']
    },
    {
      id: 'city_view_balcony',
      label: 'Balcony Door',
      icon: Eye,
      position: { x: 90, y: 90 },
      thoughtPrompt: 'Let\'s get some fresh air on the balcony',
      outcome: 'Sharing the view creates romantic tension. Intimate options appear in Day Planner.',
      gameLogic: 'narrative_gateway_unlock',
      requirements: ['apartment_tier_2']
    },
    {
      id: 'bedroom_door',
      label: 'Bedroom Door',
      icon: Bed,
      position: { x: 10, y: 10 },
      thoughtPrompt: 'Suggest heading to the bedroom',
      outcome: 'The most private space beckons. Intimate activity cards unlock in your Day Planner.',
      gameLogic: 'intimate_gateway_unlock',
      requirements: ['apartment_tier_2']
    },
    {
      id: 'entertainment_center',
      label: 'Entertainment Center',
      icon: Monitor,
      position: { x: 60, y: 65 },
      thoughtPrompt: 'Suggest watching a movie together',
      outcome: 'Movie night on your luxurious sectional sofa with premium entertainment system.',
      gameLogic: 'movie_night_activity',
      requirements: ['apartment_tier_2', 'furniture_movie_setup']
    },
    // Tier 3 - Hannam-dong Penthouse (5 nodes) - Official luxury gateway design
    {
      id: 'infinity_pool',
      label: 'Infinity Pool',
      icon: Shield,
      position: { x: 90, y: 85 },
      thoughtPrompt: 'Suggest a swim in the private pool',
      outcome: 'Exclusive high-end swimming activity with major affection gain.',
      gameLogic: 'penthouse_pool_activity',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'artifact_display',
      label: 'Artifact Display',
      icon: Shield,
      position: { x: 10, y: 15 },
      thoughtPrompt: 'Examine your trophies',
      outcome: 'Direct link to Relationship Constellation system.',
      gameLogic: 'relationship_constellation_open',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'wine_cellar',
      label: 'Wine Cellar',
      icon: ChefHat,
      position: { x: 10, y: 85 },
      thoughtPrompt: 'Select a bottle from the wine cellar',
      outcome: 'Add vintage wine to inventory for special activities.',
      gameLogic: 'wine_selection_ui',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'master_suite',
      label: 'Master Suite',
      icon: Bed,
      position: { x: 50, y: 15 },
      thoughtPrompt: 'Let\'s go to the master suite',
      outcome: 'Ultimate gateway to highest-tier intimacy.',
      gameLogic: 'ultimate_intimacy_gateway',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'private_elevator',
      label: 'Private Elevator',
      icon: Building,
      position: { x: 90, y: 50 },
      thoughtPrompt: 'Take the private elevator down',
      outcome: 'Triggers cinematic observation scene. *From up here, the entire city looks like a constellation at your feet. All the struggles, all the fights... they led to this moment of peace.*',
      gameLogic: 'penthouse_cinematic_mode',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'master_suite_door',
      label: 'Master Suite Door',
      icon: Bed,
      position: { x: 20, y: 30 },
      thoughtPrompt: 'Suggest heading to the master suite',
      outcome: 'Major narrative step signifying intent for privacy and intimacy. New intimate activities are now available in your Day Planner.',
      gameLogic: 'master_suite_gateway_unlock',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'wine_cellar_access',
      label: 'Wine Cellar',
      icon: ChefHat,
      position: { x: 20, y: 70 },
      thoughtPrompt: 'Open the wine cellar',
      outcome: '*You retrieve a bottle of vintage wine.* Adds "Vintage Wine" item to inventory for romantic activities.',
      gameLogic: 'wine_cellar_inventory_add',
      requirements: ['apartment_tier_3']
    },
    {
      id: 'private_elevator_exit',
      label: 'Private Elevator',
      icon: Building,
      position: { x: 75, y: 70 },
      thoughtPrompt: 'Take the private elevator down',
      outcome: 'Thematic exit for this location. Opens World Map to travel elsewhere.',
      gameLogic: 'penthouse_world_map_exit',
      requirements: ['apartment_tier_3']
    }
  ],

  // Gangnam District - Luxury Shopping Mall
  luxury_mall: [
    {
      id: 'jewelry_counter',
      label: 'Jewelry Counter',
      icon: ShoppingBag,
      position: { x: 15, y: 25 },
      thoughtPrompt: 'Browse the jewelry collection.',
      outcome: 'Opens the Item Inspection View displaying a featured necklace with cycling through all available jewelry gifts.',
      gameLogic: 'system_7_item_inspection'
    },
    {
      id: 'designer_apparel',
      label: 'Designer Apparel',
      icon: ShoppingBag,
      position: { x: 85, y: 20 },
      thoughtPrompt: 'Look at the designer clothing.',
      outcome: 'Opens the Item Inspection View for a featured designer dress with cycling through clothing gifts.',
      gameLogic: 'system_7_item_inspection'
    },
    {
      id: 'luxury_confections',
      label: 'Luxury Confections',
      icon: ShoppingBag,
      position: { x: 50, y: 80 },
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
      position: { x: 20, y: 30 },
      thoughtPrompt: 'Look at the sofas and tables.',
      outcome: 'Opens the Item Inspection View for featured sofa with cycling through living room furniture.',
      gameLogic: 'system_7_system_13_integration'
    },
    {
      id: 'bedroom_collection',
      label: 'Bedroom Collection',
      icon: Bed,
      position: { x: 80, y: 70 },
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
      position: { x: 25, y: 20 },
      thoughtPrompt: 'Speak with the realtor.',
      outcome: 'Initiates dialogue scene with Realtor NPC presenting available properties for sale.',
      gameLogic: 'npc_dialogue_realtor'
    },
    {
      id: 'architectural_models',
      label: 'Architectural Models',
      icon: Building,
      position: { x: 75, y: 75 },
      thoughtPrompt: 'Examine the property listings.',
      outcome: 'Opens special UI panel showing detailed Tier 2/3 apartment listing with exterior image and purchase option.',
      gameLogic: 'property_listing_ui'
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
      position: { x: 15, y: 125 },
      thoughtPrompt: 'Check the board for new gate alerts.',
      outcome: 'Opens read-only UI panel listing high-rank gates around the world for lore and world-building.',
      gameLogic: 'lore_panel_display'
    },
    {
      id: 'receptionist',
      label: 'Receptionist',
      icon: Users,
      position: { x: 80, y: 25 },
      thoughtPrompt: 'Ask the receptionist for any rumors.',
      outcome: 'Brief dialogue with Guild employee NPC providing rotating gameplay hint or rumor.',
      gameLogic: 'npc_dialogue_hints'
    },

    {
      id: 'elevator_bank',
      label: 'Elevator Bank',
      icon: Building,
      position: { x: 50, y: 80 },
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
      position: { x: 20, y: 15 },
      thoughtPrompt: 'Challenge Hae-In to a light spar.',
      outcome: 'Acts as shortcut to initiate Sparring Session activity from Daily Life Hub if conditions are met.',
      gameLogic: 'system_4_sparring_shortcut'
    },
    {
      id: 'combat_analytics',
      label: 'Combat Analytics Monitor',
      icon: Eye,
      position: { x: 85, y: 50 },
      thoughtPrompt: 'Review our last raid.',
      outcome: 'Opens UI panel with stylized stats from last completed dungeon. Triggers Review Raid Footage buff.',
      gameLogic: 'raid_stats_ui_buff'
    },
    {
      id: 'equipment_rack',
      label: 'Equipment Rack',
      icon: Shield,
      position: { x: 35, y: 85 },
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
      position: { x: 20, y: 65 },
      thoughtPrompt: 'Look at her personal items.',
      outcome: 'Observe Cha Hae-In\'s elegant makeup collection and personal accessories, gaining insight into her private life.',
      gameLogic: 'intimacy_insight_system_6'
    },
    {
      id: 'bookshelf',
      label: 'Bookshelf',
      icon: Building,
      position: { x: 80, y: 60 },
      thoughtPrompt: 'Browse her book collection.',
      outcome: 'Discover her reading preferences - hunter manuals, poetry, and romantic novels that reveal her softer side.',
      gameLogic: 'character_depth_system_6'
    },
    {
      id: 'bed',
      label: 'Bed',
      icon: Bed,
      position: { x: 50, y: 90 },
      thoughtPrompt: 'Notice the carefully made bed.',
      outcome: 'Admire her attention to detail and disciplined lifestyle. Unlocks deeper understanding of her character.',
      gameLogic: 'intimacy_progression_system_5'
    },
    {
      id: 'window_view',
      label: 'Window View',
      icon: Eye,
      position: { x: 80, y: 95 },
      thoughtPrompt: 'Look out her window.',
      outcome: 'Enjoy the view she wakes up to every morning - the Seoul skyline with hunter gates visible in distance.',
      gameLogic: 'atmospheric_immersion'
    },
    {
      id: 'tea_station',
      label: 'Tea Station',
      icon: Coffee,
      position: { x: 20, y: 95 },
      thoughtPrompt: 'Notice her tea collection.',
      outcome: 'Discover she enjoys traditional Korean teas. Option to prepare tea together for affection boost.',
      gameLogic: 'system_6_affection_activity'
    }
  ],

  // Hongdae Cafe - Coffee Date Location
  hongdae_cafe: [
    {
      id: 'menu_board',
      label: 'Artisan Menu',
      icon: Coffee,
      position: { x: 70, y: 20 },
      thoughtPrompt: 'Browse the specialty drinks menu together',
      outcome: 'Discuss coffee preferences and discover new favorites',
      gameLogic: 'casual_interaction',
      requirements: []
    },
    {
      id: 'window_seat',
      label: 'Cozy Window Seat',
      icon: Sofa,
      position: { x: 30, y: 60 },
      thoughtPrompt: 'Suggest sitting by the window for a better view',
      outcome: 'Move to a more intimate seating arrangement',
      gameLogic: 'romantic_interaction',
      requirements: []
    },
    {
      id: 'art_display',
      label: 'Local Art Display',
      icon: Eye,
      position: { x: 15, y: 40 },
      thoughtPrompt: 'Comment on the local artwork displayed on the walls',
      outcome: 'Share thoughts about art and culture together',
      gameLogic: 'cultural_interaction',
      requirements: []
    }
  ],

  // Hongdae District - Retro Arcade
  hongdae_arcade: [
    {
      id: 'fighting_game_cabinet',
      label: 'Fighting Game Cabinet',
      icon: Zap,
      position: { x: 25, y: 40 },
      thoughtPrompt: 'Challenge Cha Hae-In to a fighting game match',
      outcome: 'Competitive gaming session with skill-based outcomes and playful rivalry',
      gameLogic: 'arcade_fighting_game_minigame',
      requirements: []
    },
    {
      id: 'rhythm_game_station',
      label: 'Rhythm Game Station',
      icon: Monitor,
      position: { x: 75, y: 30 },
      thoughtPrompt: 'Try the rhythm game together',
      outcome: 'Cooperative rhythm gaming that builds teamwork and creates shared memories',
      gameLogic: 'arcade_rhythm_game_coop',
      requirements: []
    },
    {
      id: 'claw_machine',
      label: 'Claw Machine',
      icon: ShoppingBag,
      position: { x: 50, y: 75 },
      thoughtPrompt: 'Win a prize for Cha Hae-In from the claw machine',
      outcome: 'Attempt to win cute plushie. Success based on gold spent and luck',
      gameLogic: 'claw_machine_prize_game',
      requirements: []
    },
    {
      id: 'photo_booth',
      label: 'Photo Booth',
      icon: Eye,
      position: { x: 20, y: 80 },
      thoughtPrompt: 'Suggest taking photos together in the booth',
      outcome: 'Creates shared memory photos and increases intimacy through close proximity',
      gameLogic: 'photo_booth_memory_creation',
      requirements: []
    }
  ],

  // Hongdae District - Karaoke Room
  hongdae_karaoke: [
    {
      id: 'song_selection',
      label: 'Song Selection Screen',
      icon: Monitor,
      position: { x: 30, y: 20 },
      thoughtPrompt: 'Browse the song catalog together',
      outcome: 'Discover each other\'s musical preferences and select duets',
      gameLogic: 'karaoke_song_selection_bonding',
      requirements: []
    },
    {
      id: 'microphone_setup',
      label: 'Microphone Setup',
      icon: Zap,
      position: { x: 70, y: 40 },
      thoughtPrompt: 'Set up the microphones for a duet',
      outcome: 'Prepare for romantic duet performance with close collaboration',
      gameLogic: 'karaoke_duet_preparation',
      requirements: []
    },
    {
      id: 'private_seating',
      label: 'Private Couch',
      icon: Sofa,
      position: { x: 50, y: 80 },
      thoughtPrompt: 'Sit together on the couch between songs',
      outcome: 'Intimate conversation during breaks, sharing musical memories',
      gameLogic: 'karaoke_intimate_conversation',
      requirements: []
    },
    {
      id: 'mood_lighting',
      label: 'Mood Lighting Controls',
      icon: Eye,
      position: { x: 85, y: 25 },
      thoughtPrompt: 'Adjust the room lighting for ambiance',
      outcome: 'Create romantic atmosphere that enhances the karaoke experience',
      gameLogic: 'karaoke_romantic_ambiance',
      requirements: []
    }
  ],

  // Traditional Market - Korean Culture Experience
  traditional_market: [
    {
      id: 'street_food_vendor',
      label: 'Traditional Street Food',
      icon: ChefHat,
      position: { x: 30, y: 50 },
      thoughtPrompt: 'Sample authentic Korean street food together',
      outcome: 'Share traditional snacks and discuss Korean culture and childhood memories',
      gameLogic: 'cultural_food_experience',
      requirements: []
    },
    {
      id: 'handicraft_stall',
      label: 'Traditional Handicrafts',
      icon: ShoppingBag,
      position: { x: 70, y: 35 },
      thoughtPrompt: 'Browse traditional Korean handicrafts',
      outcome: 'Learn about Korean artisanship and possibly purchase meaningful gifts',
      gameLogic: 'cultural_shopping_experience',
      requirements: []
    },
    {
      id: 'tea_ceremony_area',
      label: 'Traditional Tea Ceremony',
      icon: Coffee,
      position: { x: 50, y: 75 },
      thoughtPrompt: 'Participate in a traditional tea ceremony',
      outcome: 'Formal cultural experience that deepens understanding and respect',
      gameLogic: 'tea_ceremony_cultural_bonding',
      requirements: []
    },
    {
      id: 'elderly_vendor',
      label: 'Elderly Market Vendor',
      icon: Users,
      position: { x: 20, y: 25 },
      thoughtPrompt: 'Chat with the friendly elderly vendor',
      outcome: 'Gain wisdom and local stories from experienced market vendor',
      gameLogic: 'npc_dialogue_wisdom_sharing',
      requirements: []
    }
  ],

  // Myeongdong Street - Shopping and Street Food
  myeongdong: [
    {
      id: 'cosmetics_shop',
      label: 'Korean Cosmetics Shop',
      icon: ShoppingBag,
      position: { x: 25, y: 30 },
      thoughtPrompt: 'Browse Korean beauty products together',
      outcome: 'Learn about Cha Hae-In\'s beauty routine and preferences',
      gameLogic: 'beauty_shopping_bonding',
      requirements: []
    },
    {
      id: 'street_food_cart',
      label: 'Popular Street Food Cart',
      icon: ChefHat,
      position: { x: 75, y: 45 },
      thoughtPrompt: 'Try the famous Myeongdong street food',
      outcome: 'Share spicy tteokbokki and hotteok while people-watching',
      gameLogic: 'street_food_date_experience',
      requirements: []
    },
    {
      id: 'fashion_boutique',
      label: 'Trendy Fashion Boutique',
      icon: ShoppingBag,
      position: { x: 50, y: 20 },
      thoughtPrompt: 'Look at the latest Korean fashion trends',
      outcome: 'Help Cha Hae-In pick out casual clothes outside of hunter attire',
      gameLogic: 'fashion_styling_activity',
      requirements: []
    },
    {
      id: 'street_performer',
      label: 'Street Performance',
      icon: Eye,
      position: { x: 60, y: 80 },
      thoughtPrompt: 'Watch the street performers together',
      outcome: 'Enjoy live music and entertainment while standing close together',
      gameLogic: 'street_performance_romantic_moment',
      requirements: []
    }
  ],

  // Low-Rank Gate - Dungeon Training Entrance
  low_rank_gate: [
    {
      id: 'gate_scanner',
      label: 'Gate Analysis Scanner',
      icon: Eye,
      position: { x: 30, y: 30 },
      thoughtPrompt: 'Scan the gate for threat level and monster types',
      outcome: 'Analyze dungeon contents and plan strategy with Cha Hae-In',
      gameLogic: 'gate_analysis_tactical_planning',
      requirements: []
    },
    {
      id: 'equipment_check',
      label: 'Equipment Verification',
      icon: Shield,
      position: { x: 70, y: 40 },
      thoughtPrompt: 'Check equipment readiness before entering',
      outcome: 'Ensure proper gear and weapons are equipped for safe exploration',
      gameLogic: 'pre_dungeon_equipment_check',
      requirements: []
    },
    {
      id: 'gate_entrance',
      label: 'Gate Portal',
      icon: Zap,
      position: { x: 50, y: 75 },
      thoughtPrompt: 'Enter the gate together for training',
      outcome: 'Begin low-level dungeon raid for skill development and teamwork',
      gameLogic: 'enter_training_dungeon',
      requirements: []
    },
    {
      id: 'safety_beacon',
      label: 'Emergency Safety Beacon',
      icon: Building,
      position: { x: 85, y: 20 },
      thoughtPrompt: 'Activate the safety beacon for emergency extraction',
      outcome: 'Set up safety protocols for secure training environment',
      gameLogic: 'dungeon_safety_protocol_setup',
      requirements: []
    }
  ],

  // Hunter Market - Trading Hub
  hunter_market: [
    {
      id: 'materials_trader',
      label: 'Materials Trader',
      icon: ShoppingBag,
      position: { x: 25, y: 50 },
      thoughtPrompt: 'Approach the Materials Trader to sell monster cores and rare materials',
      outcome: 'Opens trading interface for selling valuable monster drops and materials',
      gameLogic: 'system_7_commerce_materials_trading',
      requirements: []
    },
    {
      id: 'equipment_smith',
      label: 'Equipment Smith',
      icon: Shield,
      position: { x: 70, y: 40 },
      thoughtPrompt: 'Visit the Equipment Smith to upgrade weapons and armor',
      outcome: 'Access weapon and armor enhancement services',
      gameLogic: 'system_7_commerce_equipment_trading',
      requirements: []
    },
    {
      id: 'alchemist',
      label: 'Alchemist',
      icon: Zap,
      position: { x: 60, y: 65 },
      thoughtPrompt: 'Consult the Alchemist for potions and enhancement items',
      outcome: 'Browse magical potions and stat enhancement items',
      gameLogic: 'system_7_commerce_alchemy_trading',
      requirements: []
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

  // Mobile-optimized grid system with responsive positioning
  const adjustNodePositions = (rawNodes: InteractiveNode[]): InteractiveNode[] => {
    if (rawNodes.length === 0) return rawNodes;
    
    // Mobile-first responsive grid positioning
    const getResponsiveGridPosition = (index: number, total: number): { x: number; y: number } => {
      // Single node - center position
      if (total === 1) return { x: 50, y: 50 };
      
      // Two nodes - left and right with safe margins
      if (total === 2) return index === 0 ? { x: 25, y: 50 } : { x: 75, y: 50 };
      
      // Three nodes - triangle formation optimized for mobile
      if (total === 3) return [
        { x: 50, y: 25 },   // Top center
        { x: 25, y: 75 },   // Bottom left
        { x: 75, y: 75 }    // Bottom right
      ][index];
      
      // Four nodes - corners with mobile-safe margins
      if (total === 4) return [
        { x: 20, y: 25 },   // Top left
        { x: 80, y: 25 },   // Top right
        { x: 20, y: 75 },   // Bottom left
        { x: 80, y: 75 }    // Bottom right
      ][index];
      
      // Five or more nodes - organized grid pattern
      const mobileOptimizedPositions = [
        { x: 20, y: 20 },   // Top row
        { x: 50, y: 20 },
        { x: 80, y: 20 },
        { x: 20, y: 50 },   // Middle row
        { x: 80, y: 50 },
        { x: 20, y: 80 },   // Bottom row
        { x: 50, y: 80 },
        { x: 80, y: 80 },
        { x: 35, y: 35 },   // Secondary positions if needed
        { x: 65, y: 35 },
        { x: 35, y: 65 },
        { x: 65, y: 65 }
      ];
      
      return mobileOptimizedPositions[index % mobileOptimizedPositions.length];
    };
    
    return rawNodes.map((node, index) => {
      // Preserve manual positions for bottom-positioned nodes (y >= 90)
      if (node.position.y >= 90) {
        return node; // Keep original position
      }
      // Use responsive grid for other nodes
      return {
        ...node,
        position: getResponsiveGridPosition(index, rawNodes.length)
      };
    });
  };

  const rawNodes = getEnvironmentallyAvailableNodes().filter((node, index, arr) => 
    arr.findIndex(n => n.id === node.id) === index
  ); // Remove duplicates
  
  const nodes = adjustNodePositions(rawNodes);

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
    console.log('🎯 Act on Thought clicked!', { selectedNode });
    
    if (selectedNode) {
      console.log('🎯 Processing node interaction:', selectedNode.id, selectedNode.gameLogic);
      
      // Special handling for movie night activity
      if (selectedNode.gameLogic === 'movie_night_activity') {
        console.log('🎯 Movie night activity detected');
        onNodeInteraction('movie_night_setup', 'Watch a movie together', 'Opening movie night activity');
        setShowThoughtPrompt(false);
        setSelectedNode(null);
        return;
      }
      
      // Use memory-enhanced prompts and outcomes
      const memoryState = getNodeMemoryState(selectedNode);
      console.log('🎯 Memory state:', memoryState);
      console.log('🎯 Calling onNodeInteraction with:', selectedNode.id, memoryState.thoughtPrompt, memoryState.outcome);
      
      onNodeInteraction(selectedNode.id, memoryState.thoughtPrompt, memoryState.outcome);
      setShowThoughtPrompt(false);
      setSelectedNode(null);
    } else {
      console.log('🚨 No selectedNode found!');
    }
  };

  const isNodeAvailable = (node: InteractiveNode): boolean => {
    // Special handling for Red Gate - always available if story flag is set
    if (node.id === 'red_gate_entrance') {
      return true; // Always available for testing
    }

    // For apartment nodes, show all nodes up to and including current tier
    if (locationId === 'player_apartment' && node.requirements) {
      const currentTier = playerStats.apartmentTier;
      
      // Show all nodes for current tier and below
      if (node.requirements.includes('apartment_tier_1') && currentTier >= 1) return true;
      if (node.requirements.includes('apartment_tier_2') && currentTier >= 2) return true;
      if (node.requirements.includes('apartment_tier_3') && currentTier >= 3) return true;
      
      // Hide apartment nodes that require higher tier
      if (node.requirements.some(req => req.includes('apartment_tier'))) return false;
    }
    
    if (!node.requirements) return true;

    return node.requirements.every(req => {
      if (req === 'apartment_tier_1') return playerStats.apartmentTier >= 1;
      if (req === 'apartment_tier_2') return playerStats.apartmentTier >= 2;
      if (req === 'apartment_tier_3') return playerStats.apartmentTier >= 3;
      if (req === 'furniture_movie_setup') return (playerStats as any).hasPlushSofa && (playerStats as any).hasEntertainmentSystem;
      if (req === 'padlock_item') return true; // Simplified - would check inventory
      return true;
    });
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Interactive Nodes */}
      {nodes.filter(node => isNodeAvailable(node)).map((node) => {
        const available = isNodeAvailable(node);
        const IconComponent = node.icon;
        


        return (
          <motion.div
            key={node.id}
            className="absolute pointer-events-auto cursor-pointer z-40"
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`,
              transform: 'translate(-50%, -50%)', // Center the node on its position
              minWidth: '100px',
              minHeight: '100px'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🎯 NODE CLICKED:', node.id);
              handleNodeClick(node);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Mobile-optimized node container */}
            <div className="flex flex-col items-center justify-center">
              {/* Node orb with proper touch target */}
              <motion.div
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 mb-2 ${
                  available 
                    ? 'bg-purple-500/90 border-purple-300 shadow-lg' 
                    : 'bg-gray-600/70 border-gray-400'
                }`}
                animate={available ? {
                  boxShadow: [
                    '0 0 8px rgba(147, 51, 234, 0.6)',
                    '0 0 20px rgba(147, 51, 234, 0.8)',
                    '0 0 8px rgba(147, 51, 234, 0.6)'
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <IconComponent className="w-7 h-7 text-white" />
              </motion.div>

              {/* Node label positioned below orb */}
              <div className="text-center">
                <div className={`px-3 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm ${
                  available 
                    ? 'bg-black/85 border-purple-400/60 text-purple-100' 
                    : 'bg-black/70 border-gray-500/50 text-gray-300'
                }`}>
                  {node.label}
                </div>
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