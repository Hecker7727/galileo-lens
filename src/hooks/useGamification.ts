import { useState, useEffect } from 'react';
import { gamificationService, UserProgress } from '../services/gamificationService';
import { toast } from 'sonner';

// Hook to track gamification actions and show notifications
export function useGamification() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    // Load user progress on mount
    const userProgress = gamificationService.getUserProgress();
    setProgress(userProgress);
  }, []);

  // Track an action and show notification
  const trackAction = (action: 'view_publication' | 'search_query' | 'chat_message' | 'voice_session' | 'bookmark_publication' | 'identify_gap' | 'share_insight' | 'complete_forecast', metadata?: any) => {
    gamificationService.trackAction(action, metadata);
    
    // Reload progress
    const updatedProgress = gamificationService.getUserProgress();
    setProgress(updatedProgress);
    
    // Get XP reward info
    const xpInfo = gamificationService.awardXP(action);
    
    // Show notification for XP gain
    if (xpInfo.leveledUp) {
      toast.success(`🎉 Level Up! You're now Level ${xpInfo.newLevel}!`, {
        description: `You gained ${xpInfo.xpGained} XP`,
        duration: 5000,
      });
    } else if (xpInfo.xpGained > 50) {
      toast.success(`+${xpInfo.xpGained} XP`, {
        description: 'Keep exploring!',
        duration: 2000,
      });
    }
  };

  // Track publication view
  const trackPublicationView = (publicationId?: string, metadata?: any) => {
    trackAction('view_publication', metadata);
  };

  // Track search
  const trackSearch = (query: string) => {
    trackAction('search_query', { query });
  };

  // Track chat message
  const trackChatMessage = (message: string) => {
    trackAction('chat_message', { message });
  };

  // Track voice session
  const trackVoiceSession = () => {
    trackAction('voice_session');
    toast.success('+50 XP', {
      description: 'Voice session completed!',
      duration: 2000,
    });
  };

  // Track bookmark
  const trackBookmark = (publicationId: string) => {
    trackAction('bookmark_publication', { publicationId });
  };

  // Track gap identification
  const trackGapIdentification = () => {
    trackAction('identify_gap');
    toast.success('+100 XP', {
      description: 'Research gap identified!',
      duration: 3000,
    });
  };

  // Track insight sharing
  const trackInsightSharing = () => {
    trackAction('share_insight');
  };

  // Track forecast completion
  const trackForecastCompletion = () => {
    trackAction('complete_forecast');
    toast.success('+150 XP', {
      description: 'Forecast completed!',
      duration: 3000,
    });
  };

  return {
    progress,
    trackPublicationView,
    trackSearch,
    trackChatMessage,
    trackVoiceSession,
    trackBookmark,
    trackGapIdentification,
    trackInsightSharing,
    trackForecastCompletion,
  };
}

// Simpler hook for just checking progress
export function useGamificationProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const userProgress = gamificationService.getUserProgress();
    setProgress(userProgress);

    // Update progress every 5 seconds
    const interval = setInterval(() => {
      const updated = gamificationService.getUserProgress();
      setProgress(updated);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return progress;
}