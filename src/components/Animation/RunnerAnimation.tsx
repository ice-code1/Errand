import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";

export const RunnerAnimation: React.FC = () => {
  const [isDelivering, setIsDelivering] = useState(false);

  const handleClick = () => {
    if (isDelivering) return;

    setIsDelivering(true);

    setTimeout(() => {
      setIsDelivering(false);
    }, 2500); // animation duration
  };

  return (
    <>
      <AnimatePresence>
        {!isDelivering ? (
          // ✅ Draggable Floating Icon
          <motion.div
            drag // makes it draggable
            dragMomentum={false} // smoother drag
            dragConstraints={{ top: 0, bottom: window.innerHeight - 80, left: 0, right: window.innerWidth - 80 }}
            className="fixed left-4 top-1/2 z-50 cursor-grab"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
          >
            <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg">
              <User className="h-6 w-6" />
            </div>
          </motion.div>
        ) : (
          // ✅ Delivery Bounce Animation
          <motion.div
            key="delivery"
            className="fixed z-50"
            initial={{ x: 16, y: window.innerHeight / 2 }}
            animate={{
              x: [16, window.innerWidth - 80, 16],
              y: [window.innerHeight / 2, 100, window.innerHeight / 2],
            }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-green-500 text-white p-3 rounded-full shadow-lg"
              animate={{ scale: [1, 1.3, 0.9, 1.2, 1] }} // bounce effect
              transition={{ duration: 0.6, repeat: 4 }}
            >
              <User className="h-6 w-6" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


export default RunnerAnimation