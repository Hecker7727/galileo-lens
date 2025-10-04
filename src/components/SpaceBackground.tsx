/**
 * Space-Themed Background Component
 * 
 * Adds an animated, space-themed background with floating orbs
 * and optional starfield effect.
 */

import React from 'react';

interface SpaceBackgroundProps {
  variant?: 'orbs' | 'gradient' | 'minimal';
  className?: string;
}

export function SpaceBackground({ 
  variant = 'orbs',
  className = '' 
}: SpaceBackgroundProps) {
  
  if (variant === 'orbs') {
    return (
      <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        
        {/* Dark mode overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/50 dark:to-gray-950/80" />
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>
    );
  }

  // Minimal variant
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900" />
    </div>
  );
}

export default SpaceBackground;
