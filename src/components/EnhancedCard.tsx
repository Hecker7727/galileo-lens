/**
 * Enhanced Card Component with Visual Effects
 * 
 * A beautiful, animated card component with hover effects, 
 * glassmorphism, and smooth transitions.
 * 
 * Usage:
 * <EnhancedCard
 *   title="Research Publication"
 *   description="An amazing discovery..."
 *   icon={<Rocket />}
 *   variant="glass"
 *   onClick={() => console.log('clicked')}
 * />
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface EnhancedCardProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'neumorphic';
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  badge?: string;
  footer?: React.ReactNode;
}

export function EnhancedCard({
  title,
  description,
  icon,
  variant = 'default',
  children,
  onClick,
  className = '',
  badge,
  footer
}: EnhancedCardProps) {
  
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    glass: 'bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-white/20',
    gradient: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0',
    neumorphic: 'bg-gray-100 dark:bg-gray-800 shadow-neumorphic'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: variant === 'gradient' 
          ? '0 20px 40px rgba(99, 102, 241, 0.4)'
          : '0 10px 30px rgba(0, 0, 0, 0.1)',
        y: -5
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 300,
        damping: 20
      }}
      className={`relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Hover shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
        style={{ pointerEvents: 'none' }}
      />

      <Card className={`${variantStyles[variant]} ${className} relative`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {icon && (
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="flex-shrink-0"
                >
                  {icon}
                </motion.div>
              )}
              <CardTitle className="text-lg font-semibold">
                {title}
              </CardTitle>
            </div>
            {badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400"
              >
                {badge}
              </motion.span>
            )}
          </div>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-gray-600 dark:text-gray-400 mt-2"
            >
              {description}
            </motion.p>
          )}
        </CardHeader>
        {children && (
          <CardContent>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {children}
            </motion.div>
          </CardContent>
        )}
        {footer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
          >
            {footer}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

// Animated Counter Component for statistics
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ 
  value, 
  duration = 2, 
  className = '',
  suffix = '',
  prefix = ''
}: AnimatedCounterProps) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration * 60); // 60 fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'blue'
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  };

  return (
    <EnhancedCard variant="glass">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {label}
          </span>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <AnimatedCounter 
            value={value} 
            className="text-3xl font-bold"
          />
          {trend && trendValue && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </motion.span>
          )}
        </div>
      </div>
    </EnhancedCard>
  );
}

// Loading Card Skeleton
export function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="animate-pulse">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default EnhancedCard;
