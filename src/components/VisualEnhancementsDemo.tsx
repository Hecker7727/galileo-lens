/**
 * Visual Enhancements Demo Page
 * 
 * This page demonstrates all the visual enhancements available
 * for the Galileo Lenses app. Use this as a reference and testing ground.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedCard, StatCard, AnimatedCounter, CardSkeleton } from './EnhancedCard';
import { SpaceBackground } from './SpaceBackground';
import { Button } from './ui/button';
import { Rocket, Brain, Activity, TrendingUp, Sparkles, Zap } from 'lucide-react';

export function VisualEnhancementsDemo() {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [backgroundVariant, setBackgroundVariant] = useState<'orbs' | 'gradient' | 'minimal'>('orbs');

  return (
    <div className="min-h-screen p-8">
      <SpaceBackground variant={backgroundVariant} />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-gradient">
            Visual Enhancements Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore all the visual effects available in Galileo Lenses
          </p>
        </motion.div>

        {/* Background Selector */}
        <EnhancedCard title="Background Style" icon={<Sparkles className="w-6 h-6" />}>
          <div className="flex gap-4">
            <Button 
              onClick={() => setBackgroundVariant('orbs')}
              variant={backgroundVariant === 'orbs' ? 'default' : 'outline'}
            >
              Orbs
            </Button>
            <Button 
              onClick={() => setBackgroundVariant('gradient')}
              variant={backgroundVariant === 'gradient' ? 'default' : 'outline'}
            >
              Gradient
            </Button>
            <Button 
              onClick={() => setBackgroundVariant('minimal')}
              variant={backgroundVariant === 'minimal' ? 'default' : 'outline'}
            >
              Minimal
            </Button>
          </div>
        </EnhancedCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Publications Analyzed"
            value={608}
            icon={<Rocket className="w-5 h-5" />}
            trend="up"
            trendValue="100%"
            color="blue"
          />
          <StatCard
            label="AI Queries"
            value={1547}
            icon={<Brain className="w-5 h-5" />}
            trend="up"
            trendValue="+23%"
            color="purple"
          />
          <StatCard
            label="Research Gaps"
            value={42}
            icon={<Activity className="w-5 h-5" />}
            trend="neutral"
            color="orange"
          />
          <StatCard
            label="Predictions Made"
            value={156}
            icon={<TrendingUp className="w-5 h-5" />}
            trend="up"
            trendValue="+15%"
            color="green"
          />
        </div>

        {/* Card Variants */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedCard
              title="Default Card"
              description="Standard card with hover effects"
              icon={<Rocket className="w-6 h-6" />}
              variant="default"
              badge="Default"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This is the default card style with smooth animations and hover effects.
              </p>
            </EnhancedCard>

            <EnhancedCard
              title="Glass Card"
              description="Glassmorphism effect with backdrop blur"
              icon={<Sparkles className="w-6 h-6" />}
              variant="glass"
              badge="Glass"
            >
              <p className="text-sm">
                Beautiful glassmorphism effect that works great over backgrounds.
              </p>
            </EnhancedCard>

            <EnhancedCard
              title="Gradient Card"
              description="Bold gradient background"
              icon={<Zap className="w-6 h-6 text-white" />}
              variant="gradient"
              badge="New"
            >
              <p className="text-sm text-white/90">
                Eye-catching gradient card perfect for highlighting important content.
              </p>
            </EnhancedCard>

            <EnhancedCard
              title="Neumorphic Card"
              description="Soft UI design pattern"
              icon={<Brain className="w-6 h-6" />}
              variant="neumorphic"
              badge="Beta"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Subtle and elegant neumorphic design for a modern look.
              </p>
            </EnhancedCard>
          </div>
        </div>

        {/* Interactive Elements */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Interactive Elements</h2>
          
          <EnhancedCard title="Animated Counter" icon={<TrendingUp className="w-6 h-6" />}>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <AnimatedCounter value={608} className="text-4xl font-bold text-blue-600" />
                <span className="text-gray-600 dark:text-gray-400">NASA Publications</span>
              </div>
              <div className="flex items-baseline gap-2">
                <AnimatedCounter 
                  value={1000000} 
                  className="text-3xl font-bold text-purple-600"
                  prefix="$"
                />
                <span className="text-gray-600 dark:text-gray-400">Research Budget</span>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard title="Button Animations">
            <div className="flex flex-wrap gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button>Hover Me</Button>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button variant="outline">Click Me</Button>
              </motion.div>

              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(59, 130, 246, 0.7)',
                    '0 0 0 10px rgba(59, 130, 246, 0)',
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Button variant="secondary">Pulse Effect</Button>
              </motion.div>
            </div>
          </EnhancedCard>
        </div>

        {/* Loading States */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Loading States</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={() => setShowSkeleton(!showSkeleton)}>
              Toggle Skeleton
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {showSkeleton ? 'Showing skeleton loader' : 'Showing content'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showSkeleton ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : (
              <>
                <EnhancedCard
                  title="Research Paper 1"
                  description="Study on microgravity effects"
                  variant="glass"
                  badge="2024"
                />
                <EnhancedCard
                  title="Research Paper 2"
                  description="Analysis of space biology"
                  variant="glass"
                  badge="2024"
                />
                <EnhancedCard
                  title="Research Paper 3"
                  description="Predictions for Mars missions"
                  variant="glass"
                  badge="2024"
                />
              </>
            )}
          </div>
        </div>

        {/* Animation Examples */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Animation Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Float animation */}
            <EnhancedCard title="Float Animation">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex justify-center"
              >
                <Rocket className="w-16 h-16 text-blue-500" />
              </motion.div>
            </EnhancedCard>

            {/* Rotate animation */}
            <EnhancedCard title="Rotate Animation">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="flex justify-center"
              >
                <Brain className="w-16 h-16 text-purple-500" />
              </motion.div>
            </EnhancedCard>

            {/* Scale pulse */}
            <EnhancedCard title="Scale Pulse">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex justify-center"
              >
                <Activity className="w-16 h-16 text-green-500" />
              </motion.div>
            </EnhancedCard>
          </div>
        </div>

        {/* Stagger Children Animation */}
        <EnhancedCard title="Stagger Animation">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="p-4 bg-blue-500/10 rounded-lg text-center"
              >
                Item {i}
              </motion.div>
            ))}
          </motion.div>
        </EnhancedCard>
      </div>
    </div>
  );
}

export default VisualEnhancementsDemo;
