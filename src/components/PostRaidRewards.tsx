import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Gem, Coins } from 'lucide-react';

interface RewardItem {
  type: 'gold' | 'resource';
  amount?: number;
  resourceType?: string;
  resourceName?: string;
  quantity?: number;
  icon?: string;
}

interface PostRaidRewardsProps {
  isVisible: boolean;
  rewards: RewardItem[];
  onComplete: () => void;
}

export default function PostRaidRewards({ isVisible, rewards, onComplete }: PostRaidRewardsProps) {
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
  const [showingReward, setShowingReward] = useState(false);

  useEffect(() => {
    if (!isVisible || rewards.length === 0) return;

    const showNextReward = () => {
      if (currentRewardIndex < rewards.length) {
        setShowingReward(true);
        
        setTimeout(() => {
          setShowingReward(false);
          setTimeout(() => {
            if (currentRewardIndex < rewards.length - 1) {
              setCurrentRewardIndex(prev => prev + 1);
            } else {
              onComplete();
            }
          }, 500);
        }, 2500);
      }
    };

    showNextReward();
  }, [isVisible, currentRewardIndex, rewards.length, onComplete]);

  const currentReward = rewards[currentRewardIndex];

  if (!isVisible || !currentReward) return null;

  return (
    <AnimatePresence>
      {showingReward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          {currentReward.type === 'gold' && (
            <>
              {/* Golden motes streaming animation */}
              <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: `${50 + Math.random() * 30}%`, 
                      y: `${60 + Math.random() * 20}%`,
                      scale: 0,
                      opacity: 0
                    }}
                    animate={{ 
                      x: "50%", 
                      y: "85%",
                      scale: [0, 1, 0.8, 0],
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                    className="absolute w-3 h-3 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-full shadow-lg"
                    style={{
                      boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)'
                    }}
                  />
                ))}
              </div>

              {/* Gold counter */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-gradient-to-r from-amber-500/90 to-yellow-600/90 backdrop-blur-md border border-amber-300 rounded-2xl px-8 py-4 shadow-2xl">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.1, 1] }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="flex items-center gap-3"
                  >
                    <Coins className="w-8 h-8 text-amber-100" />
                    <span className="text-3xl font-bold text-amber-100">
                      + ₩{currentReward.amount?.toLocaleString('ko-KR')}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}

          {currentReward.type === 'resource' && (
            <>
              {/* Resource icon center display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.3, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0.3, 1.2, 1, 0.8],
                  y: [0, -20, -20, -100]
                }}
                transition={{ duration: 2, times: [0, 0.3, 0.7, 1] }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 0.8, repeat: 2 }}
                    className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl shadow-2xl flex items-center justify-center"
                    style={{
                      boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
                    }}
                  >
                    <Gem className="w-12 h-12 text-white" />
                  </motion.div>
                  
                  {/* Quantity indicator */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
                  >
                    x{currentReward.quantity}
                  </motion.div>
                </div>
              </motion.div>

              {/* Resource name */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute top-2/3 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-xl px-6 py-3">
                  <span className="text-xl font-semibold text-blue-300">
                    {currentReward.resourceName}
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}