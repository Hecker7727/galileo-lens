import React from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Loading NASA research data..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <motion.div
        animate={{ 
          rotate: 360,
          y: [0, -20, 0]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative"
      >
        <Rocket className="w-16 h-16 text-blue-500" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-muted-foreground text-center"
      >
        {message}
      </motion.p>
      <motion.div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}