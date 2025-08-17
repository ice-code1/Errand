import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

export const RunnerAnimation: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [showPanting, setShowPanting] = useState(false);

  const handleRunnerClick = () => {
    if (isRunning) return;

    setIsRunning(true);
    
    setTimeout(() => {
      setIsRunning(false);
      setShowPanting(true);
      
      setTimeout(() => {
        setShowPanting(false);
      }, 2000);
    }, 3000);
  };

  return (
    <>
      {/* Static Runner Character */}
      <motion.div
        className="fixed left-4 top-1/2 z-50 cursor-pointer"
        initial={{ y: -10 }}
        animate={{ y: isRunning ? -10 : 0 }}
        transition={{ duration: 0.5 }}
        onClick={handleRunnerClick}
      >
        <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
          <User className="h-6 w-6" />
        </div>
      </motion.div>

      {/* Running Animation */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            initial={{ x: 16, y: window.innerHeight / 2 }}
            animate={{
              x: [16, window.innerWidth - 64, window.innerWidth - 64, 16, 16],
              y: [
                window.innerHeight / 2,
                window.innerHeight / 2,
                64,
                64,
                window.innerHeight / 2
              ],
            }}
            transition={{ duration: 3, ease: 'linear' }}
            onAnimationComplete={() => setIsRunning(false)}
          >
            <motion.div
              className="bg-blue-500 text-white p-3 rounded-full shadow-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              <User className="h-6 w-6" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panting Animation */}
      <AnimatePresence>
        {showPanting && (
          <motion.div
            className="fixed left-4 top-1/2 z-50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-2 mb-2 relative">
              <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              <motion.span
                className="text-sm text-gray-700"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                *pant pant*
              </motion.span>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg">
              <User className="h-6 w-6" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};