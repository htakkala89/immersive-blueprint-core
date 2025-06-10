import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Coins } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuestCompletionNotificationProps {
  isVisible: boolean;
  amount: number;
  questTitle?: string;
  source?: string;
  onComplete: () => void;
}

export default function QuestCompletionNotification({ 
  isVisible, 
  amount, 
  questTitle = "Quest Complete",
  source = "Korean Hunter's Association",
  onComplete 
}: QuestCompletionNotificationProps) {
  
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowNotification(true);
      
      const timer = setTimeout(() => {
        setShowNotification(false);
        setTimeout(onComplete, 500);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            exit: { duration: 0.3 }
          }}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          {/* Liquid glassmorphism panel */}
          <div className="relative">
            {/* Background blur effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl" />
            
            {/* Hunter Association watermark */}
            <div className="absolute inset-0 opacity-5 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full" />
            </div>

            {/* Content */}
            <div className="relative px-8 py-6 min-w-[400px]">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <span className="text-xl font-bold text-white tracking-wide">
                  TRANSACTION COMPLETE
                </span>
              </motion.div>

              {/* Amount display */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-center mb-4"
              >
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Coins className="w-10 h-10 text-amber-400" />
                  </motion.div>
                  <span className="text-4xl font-bold text-amber-300">
                    ₩{amount.toLocaleString('ko-KR')}
                  </span>
                </div>
              </motion.div>

              {/* Quest title */}
              {questTitle !== "Quest Complete" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-center mb-3"
                >
                  <span className="text-lg text-blue-200 font-medium">
                    {questTitle}
                  </span>
                </motion.div>
              )}

              {/* Source */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <span className="text-sm text-gray-300">
                  Source: {source}
                </span>
              </motion.div>

              {/* Subtle animation particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0, 
                      scale: 0,
                      x: Math.random() * 400,
                      y: Math.random() * 150
                    }}
                    animate={{ 
                      opacity: [0, 0.6, 0],
                      scale: [0, 1, 0],
                      y: [Math.random() * 150, Math.random() * 150 - 50]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: 1 + i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                    className="absolute w-2 h-2 bg-amber-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}