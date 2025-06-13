import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Coffee, 
  Utensils, 
  Dumbbell, 
  Gift, 
  Home, 
  MapPin, 
  Sparkles, 
  Lock,
  Zap,
  X,
  Filter,
  Eye,
  Sword,
  Users,
  Target,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeepTFTRaidSystem } from './DeepTFTRaidSystem';

interface PlayerStats {
  gold: number;
  level: number;
  experience: number;
  affectionLevel: number;
  energy: number;
  maxEnergy: number;
  relationshipStatus: 'dating' | 'engaged' | 'married';
  intimacyLevel: number;
  sharedMemories: number;
  livingTogether: boolean;
  daysTogether: number;
  apartmentTier: number;
  hasModernKitchen: boolean;
  hasHomeGym: boolean;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  energyCost: number;
  category: 'casual' | 'training' | 'home' | 'intimate' | 'special';
  previewImage?: string;
  affectionReward?: number;
  memoryReward?: boolean;
  available: boolean;
  lockReason?: string;
  requiredLevel?: number;
  requiredApartmentTier?: number;
  requiredAffection?: number;
  outcomes?: string[];
}

interface DailyLifeHubCompleteProps {
  isVisible: boolean;
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
  playerStats: PlayerStats;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

const ACTIVITY_CATEGORIES = [
  { id: 'all', label: 'All', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'casual', label: 'Casual Outings', icon: <MapPin className="w-4 h-4" /> },
  { id: 'training', label: 'Training', icon: <Dumbbell className="w-4 h-4" /> },
  { id: 'home', label: 'Home Life', icon: <Home className="w-4 h-4" /> },
  { id: 'intimate', label: 'Intimate', icon: <Heart className="w-4 h-4" /> }
];

const getAvailableActivities = (stats: PlayerStats, timeOfDay: string): Activity[] => {
  const activities: Activity[] = [
    // Category 1: Casual Outings
    {
      id: 'grab_coffee',
      title: 'Grab a Coffee',
      description: 'Meet up at a local cafe for a quick, casual chat.',
      icon: <Coffee className="w-5 h-5" />,
      energyCost: 10,
      category: 'casual',
      affectionReward: 1,
      available: true,
      outcomes: ['Small Affection Gain']
    },
    {
      id: 'hangang_walk',
      title: 'Walk in Hangang Park',
      description: 'Take a peaceful stroll along Seoul\'s iconic river for deep conversations.',
      icon: <MapPin className="w-5 h-5" />,
      energyCost: 10,
      category: 'casual',
      affectionReward: 3,
      memoryReward: true,
      available: true,
      outcomes: ['Medium Affection Gain', 'Memory Star Creation', 'Deep Conversations']
    },
    {
      id: 'shopping_for_gifts',
      title: 'Go Shopping for Gifts',
      description: 'Visit stores together to find the perfect gift. She\'ll share her thoughts on items.',
      icon: <Gift className="w-5 h-5" />,
      energyCost: 20,
      category: 'casual',
      affectionReward: 2,
      available: stats.gold >= 500000,
      lockReason: stats.gold < 500000 ? 'Requires: Sufficient Gold for Shopping' : undefined,
      outcomes: ['Medium Affection Gain']
    },
    {
      id: 'visit_arcade',
      title: 'Visit an Arcade',
      description: 'Blow off some steam with competitive games and flashy lights.',
      icon: <Sparkles className="w-5 h-5" />,
      energyCost: 20,
      category: 'casual',
      affectionReward: 1,
      memoryReward: true,
      available: stats.affectionLevel >= 30,
      lockReason: stats.affectionLevel < 30 ? 'Requires: Affection Level 3+' : undefined,
      outcomes: ['Fun Memory', 'Small Affection Gain']
    },
    {
      id: 'see_movie',
      title: 'See a Movie',
      description: 'Catch the latest action blockbuster at the theater.',
      icon: <Heart className="w-5 h-5" />,
      energyCost: 25,
      category: 'casual',
      affectionReward: 1,
      available: stats.affectionLevel >= 40,
      lockReason: stats.affectionLevel < 40 ? 'Requires: Affection Level 4+' : undefined,
      outcomes: ['Shared Experience', 'Small Affection Gain']
    },
    {
      id: 'dinner_myeongdong',
      title: 'Dinner at Myeongdong',
      description: 'Enjoy a date at a high-end restaurant in a bustling district.',
      icon: <Utensils className="w-5 h-5" />,
      energyCost: 30,
      category: 'casual',
      affectionReward: 3,
      memoryReward: true,
      available: stats.affectionLevel >= 50 && stats.gold >= 1000000,
      lockReason: stats.affectionLevel < 50 ? 'Requires: Affection Level 5+' : 
                  stats.gold < 1000000 ? 'Requires: Sufficient Gold' : undefined,
      outcomes: ['Large Affection Gain', 'New Memory Star']
    },
    {
      id: 'n_seoul_tower',
      title: 'Visit N Seoul Tower',
      description: 'Go to the iconic tower at night for a breathtaking view of the city.',
      icon: <MapPin className="w-5 h-5" />,
      energyCost: 25,
      category: 'casual',
      affectionReward: 4,
      memoryReward: true,
      available: stats.level >= 15,
      lockReason: stats.level < 15 ? 'Unlocked after a major story event' : undefined,
      outcomes: ['Major New Memory Star']
    },

    // Category 2: Training & Hunter Life
    {
      id: 'sparring_session',
      title: 'Sparring Session',
      description: 'A light, one-on-one duel at the Hunter Association training facility.',
      icon: <Dumbbell className="w-5 h-5" />,
      energyCost: 25,
      category: 'training',
      affectionReward: 1,
      available: true,
      outcomes: ['Mutual Respect', 'Small Affection Gain']
    },
    {
      id: 'tft_style_raid',
      title: 'Strategic Dungeon Raid',
      description: 'Command your team in an advanced tactical raid with auto-battler mechanics and synergy bonuses.',
      icon: <Users className="w-5 h-5" />,
      energyCost: 40,
      category: 'training',
      affectionReward: 3,
      available: true, // Always available for testing
      lockReason: undefined,
      outcomes: ['High Gold & XP rewards', 'Team synergy bonuses', 'Character collection progress']
    },
    {
      id: 'shadow_army_management',
      title: 'Shadow Army Training',
      description: 'Organize and upgrade your shadow soldiers with TFT-style progression mechanics.',
      icon: <Crown className="w-5 h-5" />,
      energyCost: 30,
      category: 'training',
      available: stats.level >= 10,
      lockReason: stats.level < 10 ? 'Requires: Shadow Extraction ability unlocked' : undefined,
      outcomes: ['Shadow soldier upgrades', 'Army composition optimization']
    },
    {
      id: 'review_raid_footage',
      title: 'Review Raid Footage',
      description: 'Analyze footage from your last dungeon raid together to improve teamwork.',
      icon: <Eye className="w-5 h-5" />,
      energyCost: 15,
      category: 'training',
      available: stats.level >= 5,
      lockReason: stats.level < 5 ? 'After first successful Raid' : undefined,
      outcomes: ['Gameplay Buff (+5% Synergy gain on next raid)']
    },
    {
      id: 'clear_low_rank_gate',
      title: 'Clear a Low-Rank Gate',
      description: 'A "casual" hunt. Take down a C-Rank or D-Rank gate together for quick cash and practice.',
      icon: <Sword className="w-5 h-5" />,
      energyCost: 35,
      category: 'training',
      affectionReward: 2,
      available: stats.level >= 10,
      lockReason: stats.level < 10 ? 'Requires: Player Level 10+' : undefined,
      outcomes: ['Gold Gain', 'Medium Affection Gain']
    },
    {
      id: 'coop_skill_training',
      title: 'Co-op Skill Training',
      description: 'Work together in a specialized training room to practice your Synergy Attack.',
      icon: <Sparkles className="w-5 h-5" />,
      energyCost: 25,
      category: 'training',
      available: stats.affectionLevel >= 30,
      lockReason: stats.affectionLevel < 30 ? 'Synergy System Unlocked' : undefined,
      outcomes: ['Increases Synergy Gauge fill rate']
    },
    {
      id: 'review_raid_footage',
      title: 'Review Raid Footage',
      description: 'Analyze your recent raid performance together at the Hunter Association HQ.',
      icon: <Eye className="w-5 h-5" />,
      energyCost: 15,
      category: 'training',
      available: true, // Temporarily enabled for testing
      lockReason: undefined,
      outcomes: ['+5% Synergy bonus on next raid', 'Professional development']
    },
    {
      id: 'clear_low_rank_gate',
      title: 'Clear a Low-Rank Gate',
      description: 'Take on a casual D-Rank or C-Rank gate together for practice and income.',
      icon: <Sword className="w-5 h-5" />,
      energyCost: 20,
      category: 'training',
      available: true, // Temporarily enabled for testing
      lockReason: undefined,
      outcomes: ['Gold & XP rewards', 'Medium Affection gain']
    },

    // Activity 11: Visit N Seoul Tower
    {
      id: 'n_seoul_tower',
      title: 'Visit N Seoul Tower',
      description: 'A romantic milestone date at Seoul\'s most iconic landmark.',
      icon: <MapPin className="w-5 h-5" />,
      energyCost: 30,
      category: 'special',
      available: stats.affectionLevel >= 80,
      lockReason: stats.affectionLevel < 80 ? 'Requires: Affection Level 8+' : undefined,
      outcomes: ['S-Rank Memory Star', 'Ultimate romantic milestone']
    },

    // Activity 12: Co-op Skill Training (Updated)
    {
      id: 'coop_skill_training_advanced',
      title: 'Advanced Co-op Training',
      description: 'Intensive synergy training with rhythm-based coordination challenges.',
      icon: <Zap className="w-5 h-5" />,
      energyCost: 25,
      category: 'training',
      available: stats.affectionLevel >= 30,
      lockReason: stats.affectionLevel < 30 ? 'Synergy System Unlocked' : undefined,
      outcomes: ['Permanent synergy buff', 'Combat coordination']
    },
    {
      id: 'tft_style_raid',
      title: 'Strategic Dungeon Raid',
      description: 'Command your shadow army in a tactical auto-battler raid with team positioning and synergy bonuses.',
      icon: <Users className="w-5 h-5" />,
      energyCost: 40,
      category: 'training',
      affectionReward: 3,
      available: stats.level >= 5,
      lockReason: stats.level < 5 ? 'Requires: Player Level 5+' : undefined,
      outcomes: ['High Gold & XP rewards', 'Team synergy bonuses', 'Shadow army upgrades']
    },

    // Category 3: Home Life
    {
      id: 'order_takeout',
      title: 'Order Takeout',
      description: 'Too tired to cook? Order in and relax at home.',
      icon: <Utensils className="w-5 h-5" />,
      energyCost: 10,
      category: 'home',
      affectionReward: 1,
      available: stats.affectionLevel >= 60,
      lockReason: stats.affectionLevel < 60 ? 'Unlocks her Apartment (Affection Level 6+)' : undefined,
      outcomes: ['Restorative', 'Small Affection Gain']
    },
    {
      id: 'cook_dinner_together',
      title: 'Cook Dinner Together',
      description: 'Try to make a meal together in your upgraded kitchen. Success is not guaranteed!',
      icon: <Utensils className="w-5 h-5" />,
      energyCost: 20,
      category: 'home',
      affectionReward: 2,
      memoryReward: true,
      available: stats.apartmentTier >= 2,
      lockReason: stats.apartmentTier < 2 ? 'Requires: Tier 2 Apartment' : undefined,
      outcomes: ['Fun Memory', 'Medium Affection Gain']
    },
    {
      id: 'assemble_furniture',
      title: 'Assemble New Furniture',
      description: 'You bought a new item from the store. Now for the real challenge: building it together.',
      icon: <Home className="w-5 h-5" />,
      energyCost: 15,
      category: 'home',
      available: stats.gold >= 2000000,
      lockReason: stats.gold < 2000000 ? 'After buying new furniture' : undefined,
      outcomes: ['Fun/Frustrating Memory', 'Unlocks item for use']
    },
    {
      id: 'movie_on_couch',
      title: 'Watch a Movie on the Couch',
      description: 'Cuddle up on your new sofa and watch a movie from your high-tech media center.',
      icon: <Heart className="w-5 h-5" />,
      energyCost: 15,
      category: 'home',
      affectionReward: 2,
      available: stats.apartmentTier >= 2,
      lockReason: stats.apartmentTier < 2 ? 'Requires: Tier 2 Apt + Sofa/TV purchase' : undefined,
      outcomes: ['Medium Affection Gain', 'Intimacy prerequisite']
    },
    {
      id: 'talk_on_balcony',
      title: 'Talk on the Balcony',
      description: 'Just spend some quiet time together, looking out at the city from your new home.',
      icon: <MapPin className="w-5 h-5" />,
      energyCost: 10,
      category: 'home',
      affectionReward: 2,
      available: stats.apartmentTier >= 2,
      lockReason: stats.apartmentTier < 2 ? 'Requires: Tier 2 or 3 Apartment' : undefined,
      outcomes: ['Deep Conversation', 'Medium Affection Gain']
    },
    {
      id: 'swim_private_pool',
      title: 'Swim in the Private Pool',
      description: 'Relax and unwind in the ultimate luxury of your penthouse pool.',
      icon: <Sparkles className="w-5 h-5" />,
      energyCost: 25,
      category: 'home',
      memoryReward: true,
      available: stats.apartmentTier >= 3,
      lockReason: stats.apartmentTier < 3 ? 'Requires: Tier 3 Penthouse' : undefined,
      outcomes: ['Intimacy prerequisite', 'New Memory Star']
    },

    // Category 4: Intimate
    {
      id: 'give_back_rub',
      title: 'Give a Back Rub',
      description: 'After a long day of fighting, help her relax and ease her sore muscles.',
      icon: <Heart className="w-5 h-5" />,
      energyCost: 15,
      category: 'intimate',
      affectionReward: 2,
      available: stats.affectionLevel >= 70,
      lockReason: stats.affectionLevel < 70 ? 'Requires: Affection Level 7+' : undefined,
      outcomes: ['Medium Affection Gain', 'Trust']
    },
    {
      id: 'cuddle_all_morning',
      title: 'Cuddle All Morning',
      description: 'Spend a lazy morning in bed, just holding each other and talking.',
      icon: <Heart className="w-5 h-5" />,
      energyCost: 20,
      category: 'intimate',
      affectionReward: 3,
      available: stats.affectionLevel >= 80 && stats.apartmentTier >= 2,
      lockReason: stats.affectionLevel < 80 ? 'Requires: Affection Level 8+' : 
                  stats.apartmentTier < 2 ? 'Requires: Tier 2 Apartment' : undefined,
      outcomes: ['Large Affection Gain', 'Intimacy']
    },
    {
      id: 'shower_together',
      title: 'Take a Shower Together',
      description: 'A deeply intimate and vulnerable moment in your luxurious new bathroom.',
      icon: <Heart className="w-5 h-5" />,
      energyCost: 25,
      category: 'intimate',
      affectionReward: 4,
      available: stats.affectionLevel >= 90 && stats.apartmentTier >= 2,
      lockReason: stats.affectionLevel < 90 ? 'Requires: Affection Level 9+' : 
                  stats.apartmentTier < 2 ? 'Requires: Tier 2 Apartment' : undefined,
      outcomes: ['High Affection Gain', 'Unlocks new dialogue']
    },
    {
      id: 'passionate_night',
      title: 'A Passionate Night',
      description: 'A scene focused on intense passion and connection.',
      icon: <Heart className="w-5 h-5" />,
      energyCost: 30,
      category: 'intimate',
      affectionReward: 5,
      available: stats.affectionLevel >= 100 && stats.apartmentTier >= 2,
      lockReason: stats.affectionLevel < 100 ? 'Requires: Affection Level 10+' : 
                  stats.apartmentTier < 2 ? 'Requires: Tier 2 Apartment' : undefined,
      outcomes: ['Very High Affection Gain', 'New Memory Star']
    },
    {
      id: 'spend_night_together',
      title: 'Spend the Night Together',
      description: 'The full experience of making love and waking up together the next morning.',
      icon: <Heart className="w-5 h-5" />,
      energyCost: 35,
      category: 'intimate',
      affectionReward: 6,
      memoryReward: true,
      available: stats.affectionLevel >= 100 && stats.apartmentTier >= 3,
      lockReason: stats.affectionLevel < 100 ? 'Requires: Max Affection' : 
                  stats.apartmentTier < 3 ? 'Requires: Tier 3 Penthouse' : undefined,
      outcomes: ['Ultimate Relationship Milestone']
    },

    // Special Activities
    {
      id: 'give_gift',
      title: 'Give a Special Gift',
      description: 'Present one of your carefully chosen gifts to Cha Hae-In.',
      icon: <Gift className="w-5 h-5" />,
      energyCost: 5,
      category: 'special',
      affectionReward: 3,
      available: true,
      outcomes: ['Affection+++', 'Gratitude+']
    }
  ];

  return activities;
};

const getGreetingMessage = (timeOfDay: string, affectionLevel: number): string => {
  const baseGreetings = {
    morning: "Good morning, Jin-Woo! What should we do today?",
    afternoon: "The afternoon is perfect for spending time together. What do you have in mind?",
    evening: "What a lovely evening! How would you like to spend it with me?",
    night: "The night is still young... what should we do together?"
  };

  if (affectionLevel >= 80) {
    return {
      morning: "Good morning, my love! Every day with you feels like a new adventure. What should we do today?",
      afternoon: "Another beautiful afternoon with my Shadow Monarch. How shall we spend our time together?",
      evening: "Evening already? Time flies when I'm with you. What would make tonight special?",
      night: "Just you and me under the stars... what should we do tonight, darling?"
    }[timeOfDay] || baseGreetings[timeOfDay as keyof typeof baseGreetings];
  } else if (affectionLevel >= 40) {
    return {
      morning: "Morning, Jin-Woo! I've been looking forward to spending time with you. What should we do?",
      afternoon: "Perfect timing! I was just thinking about you. What do you want to do together?",
      evening: "The evening is ours. What sounds good to you?",
      night: "A quiet night together sounds perfect. What do you have in mind?"
    }[timeOfDay] || baseGreetings[timeOfDay as keyof typeof baseGreetings];
  }

  return baseGreetings[timeOfDay as keyof typeof baseGreetings];
};

export function DailyLifeHubComplete({ 
  isVisible, 
  onClose, 
  onActivitySelect, 
  playerStats, 
  timeOfDay 
}: DailyLifeHubCompleteProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const [showTFTRaid, setShowTFTRaid] = useState(false);
  
  const availableActivities = getAvailableActivities(playerStats, timeOfDay);
  const greetingMessage = getGreetingMessage(timeOfDay, playerStats.affectionLevel);

  // Debug activities list
  useEffect(() => {
    console.log('🎮 Available activities:', availableActivities.map(a => ({ id: a.id, title: a.title, available: a.available })));
    const tftActivity = availableActivities.find(a => a.id === 'tft_style_raid');
    console.log('⚔️ TFT Raid activity details:', tftActivity ? { 
      id: tftActivity.id, 
      title: tftActivity.title, 
      available: tftActivity.available,
      lockReason: tftActivity.lockReason,
      playerLevel: playerStats.level,
      requiredLevel: 5
    } : 'not found');
    console.log('📊 Player stats:', { level: playerStats.level, energy: playerStats.energy, affection: playerStats.affectionLevel });
  }, [availableActivities, playerStats]);

  const filteredActivities = selectedCategory === 'all' 
    ? availableActivities 
    : availableActivities.filter(activity => activity.category === selectedCategory);

  const handleActivitySelect = (activity: Activity) => {
    console.log('🎯 Activity clicked:', activity.id, activity.title);
    console.log('📊 Activity available:', activity.available);
    console.log('⚡ Player energy:', playerStats.energy, 'Required:', activity.energyCost);
    
    // Handle TFT raid system
    if (activity.id === 'tft_style_raid') {
      console.log('🎯 TFT Raid clicked - setting showTFTRaid to true');
      console.log('Current showTFTRaid state:', showTFTRaid);
      console.log('Activity available check:', activity.available);
      console.log('Energy check:', playerStats.energy, '>=', activity.energyCost, '?', playerStats.energy >= activity.energyCost);
      
      // Force the modal to show immediately
      setShowTFTRaid(true);
      console.log('TFT Raid modal state set to true');
      
      // Add a timeout check to verify the modal appears
      setTimeout(() => {
        console.log('Delayed check - TFT modal visible?', showTFTRaid);
      }, 100);
      
      return; // Prevent parent activity handler from running
    }
    
    if (!activity.available) {
      console.log('❌ Activity not available');
      return;
    }
    if (playerStats.energy < activity.energyCost) {
      console.log('❌ Not enough energy');
      return;
    }
    
    // Handle coffee activity - pass to parent
    if (activity.id === 'grab_coffee') {
      console.log('☕ Coffee activity selected - passing to parent');
      onActivitySelect(activity);
      return;
    }
    
    console.log('🚀 Passing to parent:', activity.id);
    onActivitySelect(activity);
  };



  const getEnergyOrbStyle = () => {
    const energyPercentage = (playerStats.energy / playerStats.maxEnergy) * 100;
    if (energyPercentage > 70) return 'from-purple-400 to-purple-600 shadow-purple-400/50';
    if (energyPercentage > 30) return 'from-yellow-400 to-orange-500 shadow-yellow-400/50';
    return 'from-red-400 to-red-600 shadow-red-400/50';
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center"
      >
        {/* Beautiful Background with Glass Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-blue-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.1)_0%,transparent_50%)]" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-6xl mx-4 h-[90vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header with Greeting */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-white font-bold text-2xl mb-2">Day Planner</h2>
                <p className="text-purple-200 text-lg italic">{greetingMessage}</p>
              </div>
              
              {/* Energy Orb */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getEnergyOrbStyle()} flex items-center justify-center shadow-lg`}>
                    <div className="text-white font-bold text-lg">
                      {playerStats.energy}
                    </div>
                  </div>
                  <div className="text-white/70 text-sm mt-1">Energy</div>
                </div>

                
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:bg-white/10 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex-shrink-0 p-6 border-b border-white/10">
            <div className="flex gap-2 overflow-x-auto">
              {ACTIVITY_CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className={`whitespace-nowrap flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {category.icon}
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Activity Cards Grid - Scrollable Area */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                {filteredActivities.map((activity) => {
                  const canAfford = playerStats.energy >= activity.energyCost;
                  const isLocked = !activity.available;
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: isLocked ? 1 : 1.02 }}
                      onHoverStart={() => setHoveredActivity(activity.id)}
                      onHoverEnd={() => setHoveredActivity(null)}
                      className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 cursor-pointer transition-all duration-300 ${
                        isLocked 
                          ? 'opacity-50 cursor-not-allowed' 
                          : canAfford
                          ? 'hover:bg-white/10 hover:border-purple-400/30 hover:shadow-purple-400/20 hover:shadow-lg'
                          : 'cursor-not-allowed'
                      }`}
                      onClick={() => {
                        console.log('🖱️ Button clicked for activity:', activity.id);
                        console.log('🖱️ Activity available:', activity.available);
                        console.log('🖱️ Can afford (energy):', canAfford);
                        console.log('🖱️ Is locked:', isLocked);
                        
                        handleActivitySelect(activity);
                      }}
                    >
                      {/* Lock Overlay */}
                      {isLocked && (
                        <div className="absolute top-4 right-4">
                          <Lock className="w-5 h-5 text-red-400" />
                        </div>
                      )}

                      {/* Activity Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        isLocked 
                          ? 'bg-gray-600/50 text-gray-400' 
                          : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                      }`}>
                        {activity.icon}
                      </div>

                      {/* Activity Info */}
                      <h3 className="text-white font-bold text-lg mb-2">{activity.title}</h3>
                      <p className="text-white/70 text-sm mb-4 leading-relaxed">{activity.description}</p>

                      {/* Energy Cost */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                          canAfford && !isLocked
                            ? 'bg-purple-600/20 text-purple-300'
                            : 'bg-red-600/20 text-red-300'
                        }`}>
                          <Zap className="w-4 h-4" />
                          <span className="text-sm font-semibold">-{activity.energyCost}</span>
                        </div>
                      </div>

                      {/* Outcomes */}
                      {activity.outcomes && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {activity.outcomes.map((outcome, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-pink-600/20 text-pink-300 text-xs rounded-full"
                            >
                              {outcome}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Lock Reason */}
                      {isLocked && activity.lockReason && (
                        <div className="text-red-400 text-xs bg-red-900/20 rounded-lg p-2 border border-red-600/30">
                          🔒 {activity.lockReason}
                        </div>
                      )}

                      {/* Insufficient Energy Warning */}
                      {!isLocked && !canAfford && (
                        <div className="text-yellow-400 text-xs bg-yellow-900/20 rounded-lg p-2 border border-yellow-600/30">
                          ⚡ Not enough energy
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>



      {/* TFT-Style Raid System */}
      {showTFTRaid && (
        <DeepTFTRaidSystem
          isVisible={showTFTRaid}
          onClose={() => {
            console.log('Closing TFT Raid modal');
            setShowTFTRaid(false);
          }}
          onRaidComplete={(result) => {
            console.log('TFT Raid completed:', result);
            setShowTFTRaid(false);
            // Handle raid completion rewards here
            if (result?.success) {
              onActivitySelect({
                id: 'tft_style_raid',
                title: 'Strategic Dungeon Raid',
                description: 'Tactical raid completed successfully',
                icon: <Users className="w-5 h-5" />,
                energyCost: 40,
                category: 'training',
                affectionReward: 3,
                available: true,
                outcomes: ['High Gold & XP rewards', 'Team synergy bonuses']
              });
            }
          }}
          playerLevel={playerStats.level}
          affectionLevel={playerStats.affectionLevel}
        />
      )}
    </AnimatePresence>
  );
}