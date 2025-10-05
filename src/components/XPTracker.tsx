import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import { Badge } from './ui/badge';
import { useGamificationProgress } from '../hooks/useGamification';
import { getLevelProgress } from '../services/gamificationService';

export function XPTracker() {
  const progress = useGamificationProgress();

  if (!progress) return null;

  const levelProgress = getLevelProgress(progress.totalXP);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-2"
    >
      <Badge 
        variant="secondary" 
        className="bg-yellow-500/10 text-yellow-600 border-yellow-300 hover:bg-yellow-500/20 cursor-pointer"
      >
        <Trophy className="h-3 w-3 mr-1" />
        <span className="font-bold">Lvl {progress.level}</span>
      </Badge>
      
      <Badge 
        variant="secondary" 
        className="bg-purple-500/10 text-purple-600 border-purple-300 hover:bg-purple-500/20 cursor-pointer"
      >
        <Zap className="h-3 w-3 mr-1" />
        <span className="font-bold">{progress.totalXP.toLocaleString()}</span>
      </Badge>
      
      {/* Mini progress bar */}
      <div className="hidden md:flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
        <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress.percentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
          />
        </div>
        <span className="text-xs text-white/80">{Math.round(levelProgress.percentage)}%</span>
      </div>
    </motion.div>
  );
}