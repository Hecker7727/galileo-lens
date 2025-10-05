// Gamification Service - Track user progress, XP, badges, and quests
import { ChatMessage } from '../types/dataTypes';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number;
  requirement: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'exploration' | 'discovery' | 'contribution' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  requirements: QuestRequirement[];
  reward: {
    xp: number;
    badge?: string; // Badge ID to award
    unlocks?: string[]; // Feature IDs to unlock
  };
  progress: number;
  total: number;
  completed: boolean;
  completedAt?: Date;
}

export interface QuestRequirement {
  type: 'view_publications' | 'search_queries' | 'chat_messages' | 'voice_sessions' | 'identify_gaps' | 'bookmark_pubs' | 'daily_streak' | 'share_insights' | 'complete_forecast';
  count: number;
  filter?: any;
}

export interface UserProgress {
  userId: string;
  username: string;
  level: number;
  xp: number;
  totalXP: number;
  badges: Badge[];
  completedQuests: string[];
  activeQuests: string[];
  stats: {
    publicationsViewed: number;
    searchesMade: number;
    chatMessages: number;
    voiceSessions: number;
    gapsIdentified: number;
    bookmarks: number;
    daysStreak: number;
    lastLoginDate: string;
    insightsShared: number;
    forecastsCompleted: number;
  };
  achievements: string[];
  createdAt: Date;
  lastUpdated: Date;
}

// XP required for each level (exponential growth)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Calculate level from total XP
export function calculateLevel(totalXP: number): number {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXP) {
    xpNeeded += getXPForLevel(level);
    if (xpNeeded <= totalXP) {
      level++;
    }
  }
  
  return level;
}

// Get XP progress in current level
export function getLevelProgress(totalXP: number): { current: number; needed: number; percentage: number } {
  const level = calculateLevel(totalXP);
  let xpForPreviousLevels = 0;
  
  for (let i = 1; i < level; i++) {
    xpForPreviousLevels += getXPForLevel(i);
  }
  
  const currentLevelXP = totalXP - xpForPreviousLevels;
  const xpNeededForNextLevel = getXPForLevel(level);
  const percentage = (currentLevelXP / xpNeededForNextLevel) * 100;
  
  return {
    current: currentLevelXP,
    needed: xpNeededForNextLevel,
    percentage: Math.min(percentage, 100)
  };
}

// All available badges
export const ALL_BADGES: Badge[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'View your first publication',
    icon: '👣',
    rarity: 'common',
    requirement: 1
  },
  {
    id: 'curious-explorer',
    name: 'Curious Explorer',
    description: 'View 10 publications',
    icon: '🔍',
    rarity: 'common',
    requirement: 10
  },
  {
    id: 'bone-expert',
    name: 'Bone Loss Expert',
    description: 'View 15 publications about bone health',
    icon: '🦴',
    rarity: 'rare',
    requirement: 15
  },
  {
    id: 'radiation-specialist',
    name: 'Radiation Specialist',
    description: 'Study radiation effects research',
    icon: '☢️',
    rarity: 'rare',
    requirement: 10
  },
  {
    id: 'microgravity-master',
    name: 'Microgravity Master',
    description: 'Master microgravity research',
    icon: '🌌',
    rarity: 'epic',
    requirement: 20
  },
  {
    id: 'gap-hunter',
    name: 'Gap Hunter',
    description: 'Identify 5 research gaps',
    icon: '🎯',
    rarity: 'rare',
    requirement: 5
  },
  {
    id: 'chat-enthusiast',
    name: 'Chat Enthusiast',
    description: 'Have 50 conversations with Galileo AI',
    icon: '💬',
    rarity: 'rare',
    requirement: 50
  },
  {
    id: 'voice-commander',
    name: 'Voice Commander',
    description: 'Complete 10 voice sessions',
    icon: '🎙️',
    rarity: 'epic',
    requirement: 10
  },
  {
    id: 'research-dedication',
    name: 'Dedicated Researcher',
    description: 'Use the platform 7 days in a row',
    icon: '🔥',
    rarity: 'epic',
    requirement: 7
  },
  {
    id: 'bookmark-collector',
    name: 'Bookmark Collector',
    description: 'Bookmark 25 publications',
    icon: '📚',
    rarity: 'rare',
    requirement: 25
  },
  {
    id: 'insight-sharer',
    name: 'Insight Sharer',
    description: 'Share 10 research insights',
    icon: '✨',
    rarity: 'epic',
    requirement: 10
  },
  {
    id: 'forecast-master',
    name: 'Forecast Master',
    description: 'Complete 5 health risk forecasts',
    icon: '🔮',
    rarity: 'epic',
    requirement: 5
  },
  {
    id: 'search-master',
    name: 'Search Master',
    description: 'Perform 100 searches',
    icon: '🔎',
    rarity: 'rare',
    requirement: 100
  },
  {
    id: 'legendary-researcher',
    name: 'Legendary Researcher',
    description: 'Reach level 10',
    icon: '👑',
    rarity: 'legendary',
    requirement: 10
  },
  {
    id: 'space-biologist',
    name: 'Space Biologist',
    description: 'Master all research areas',
    icon: '🧬',
    rarity: 'legendary',
    requirement: 50
  }
];

// All available quests
export const ALL_QUESTS: Quest[] = [
  {
    id: 'welcome-quest',
    title: '👋 Welcome to Galileo\'s Lenses',
    description: 'Get started by exploring the platform',
    type: 'exploration',
    difficulty: 'easy',
    requirements: [
      { type: 'view_publications', count: 3 },
      { type: 'search_queries', count: 1 }
    ],
    reward: {
      xp: 100,
      badge: 'first-steps'
    },
    progress: 0,
    total: 2,
    completed: false
  },
  {
    id: 'bone-loss-detective',
    title: '🦴 Bone Loss Detective',
    description: 'Investigate bone density research in space',
    type: 'exploration',
    difficulty: 'medium',
    requirements: [
      { type: 'view_publications', count: 15, filter: { researchArea: 'Bone Health' } }
    ],
    reward: {
      xp: 500,
      badge: 'bone-expert'
    },
    progress: 0,
    total: 15,
    completed: false
  },
  {
    id: 'gap-finder',
    title: '🔍 Research Gap Hunter',
    description: 'Identify research opportunities in the dataset',
    type: 'discovery',
    difficulty: 'hard',
    requirements: [
      { type: 'identify_gaps', count: 5 }
    ],
    reward: {
      xp: 1000,
      badge: 'gap-hunter'
    },
    progress: 0,
    total: 5,
    completed: false
  },
  {
    id: 'chat-master',
    title: '💬 AI Conversation Expert',
    description: 'Have meaningful conversations with Galileo AI',
    type: 'exploration',
    difficulty: 'medium',
    requirements: [
      { type: 'chat_messages', count: 50 }
    ],
    reward: {
      xp: 800,
      badge: 'chat-enthusiast'
    },
    progress: 0,
    total: 50,
    completed: false
  },
  {
    id: 'voice-pioneer',
    title: '🎙️ Voice Research Pioneer',
    description: 'Explore research using voice commands',
    type: 'challenge',
    difficulty: 'hard',
    requirements: [
      { type: 'voice_sessions', count: 10 }
    ],
    reward: {
      xp: 1500,
      badge: 'voice-commander'
    },
    progress: 0,
    total: 10,
    completed: false
  },
  {
    id: 'daily-researcher',
    title: '🔥 Daily Dedication',
    description: 'Build a research habit',
    type: 'challenge',
    difficulty: 'medium',
    requirements: [
      { type: 'daily_streak', count: 7 }
    ],
    reward: {
      xp: 2000,
      badge: 'research-dedication'
    },
    progress: 0,
    total: 7,
    completed: false
  },
  {
    id: 'bookmark-master',
    title: '📚 Knowledge Curator',
    description: 'Build your personal research library',
    type: 'contribution',
    difficulty: 'easy',
    requirements: [
      { type: 'bookmark_pubs', count: 25 }
    ],
    reward: {
      xp: 600,
      badge: 'bookmark-collector'
    },
    progress: 0,
    total: 25,
    completed: false
  },
  {
    id: 'forecast-expert',
    title: '🔮 Mission Planner',
    description: 'Master health risk forecasting',
    type: 'challenge',
    difficulty: 'hard',
    requirements: [
      { type: 'complete_forecast', count: 5 }
    ],
    reward: {
      xp: 1200,
      badge: 'forecast-master'
    },
    progress: 0,
    total: 5,
    completed: false
  },
  {
    id: 'search-explorer',
    title: '🔎 Search Specialist',
    description: 'Master the art of research discovery',
    type: 'exploration',
    difficulty: 'medium',
    requirements: [
      { type: 'search_queries', count: 100 }
    ],
    reward: {
      xp: 900,
      badge: 'search-master'
    },
    progress: 0,
    total: 100,
    completed: false
  }
];

// XP rewards for different actions
export const XP_REWARDS: Record<string, number> = {
  view_publication: 10,
  search_query: 5,
  chat_message: 15,
  voice_session: 50,
  bookmark_publication: 20,
  identify_gap: 100,
  complete_quest: 500,
  daily_login: 25,
  share_insight: 75,
  complete_forecast: 150,
  unlock_badge: 200
};

class GamificationService {
  private readonly STORAGE_KEY = 'galileo_user_progress';
  
  // Get or create user progress
  getUserProgress(): UserProgress {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (stored) {
      const progress = JSON.parse(stored);
      // Update level based on total XP
      progress.level = calculateLevel(progress.totalXP);
      return progress;
    }
    
    // Create new user progress
    const newProgress: UserProgress = {
      userId: this.generateUserId(),
      username: 'Research Explorer',
      level: 1,
      xp: 0,
      totalXP: 0,
      badges: [],
      completedQuests: [],
      activeQuests: ALL_QUESTS.slice(0, 3).map(q => q.id), // Start with first 3 quests
      stats: {
        publicationsViewed: 0,
        searchesMade: 0,
        chatMessages: 0,
        voiceSessions: 0,
        gapsIdentified: 0,
        bookmarks: 0,
        daysStreak: 0,
        lastLoginDate: new Date().toISOString(),
        insightsShared: 0,
        forecastsCompleted: 0
      },
      achievements: [],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    this.saveProgress(newProgress);
    return newProgress;
  }
  
  // Save progress to localStorage
  private saveProgress(progress: UserProgress): void {
    progress.lastUpdated = new Date();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }
  
  // Award XP for an action
  awardXP(action: string, amount?: number): { xpGained: number; leveledUp: boolean; newLevel?: number } {
    const progress = this.getUserProgress();
    const xpGained = amount || XP_REWARDS[action] || 0;
    
    const oldLevel = progress.level;
    progress.totalXP += xpGained;
    progress.xp += xpGained;
    const newLevel = calculateLevel(progress.totalXP);
    
    const leveledUp = newLevel > oldLevel;
    if (leveledUp) {
      progress.level = newLevel;
    }
    
    this.saveProgress(progress);
    
    return { xpGained, leveledUp, newLevel: leveledUp ? newLevel : undefined };
  }
  
  // Track an action and update stats
  trackAction(action: QuestRequirement['type'], metadata?: any): void {
    const progress = this.getUserProgress();
    
    // Update stats
    switch (action) {
      case 'view_publications':
        progress.stats.publicationsViewed++;
        this.awardXP('view_publication');
        break;
      case 'search_queries':
        progress.stats.searchesMade++;
        this.awardXP('search_query');
        break;
      case 'chat_messages':
        progress.stats.chatMessages++;
        this.awardXP('chat_message');
        break;
      case 'voice_sessions':
        progress.stats.voiceSessions++;
        this.awardXP('voice_session');
        break;
      case 'identify_gaps':
        progress.stats.gapsIdentified++;
        this.awardXP('identify_gap');
        break;
      case 'bookmark_pubs':
        progress.stats.bookmarks++;
        this.awardXP('bookmark_publication');
        break;
      case 'share_insights':
        progress.stats.insightsShared++;
        this.awardXP('share_insight');
        break;
      case 'complete_forecast':
        progress.stats.forecastsCompleted++;
        this.awardXP('complete_forecast');
        break;
    }
    
    // Update daily streak
    this.updateDailyStreak(progress);
    
    // Check for quest progress
    this.updateQuestProgress(progress, action, metadata);
    
    // Check for badge unlocks
    this.checkBadgeUnlocks(progress);
    
    this.saveProgress(progress);
  }
  
  // Update daily streak
  private updateDailyStreak(progress: UserProgress): void {
    const lastLogin = new Date(progress.stats.lastLoginDate);
    const today = new Date();
    
    const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      progress.stats.daysStreak++;
    } else if (daysDiff > 1) {
      // Streak broken
      progress.stats.daysStreak = 1;
    }
    // If daysDiff === 0, same day, don't change streak
    
    progress.stats.lastLoginDate = today.toISOString();
  }
  
  // Update quest progress based on action
  private updateQuestProgress(progress: UserProgress, action: QuestRequirement['type'], metadata?: any): void {
    const activeQuests = ALL_QUESTS.filter(q => 
      progress.activeQuests.includes(q.id) && !progress.completedQuests.includes(q.id)
    );
    
    activeQuests.forEach(quest => {
      quest.requirements.forEach(req => {
        if (req.type === action) {
          // Check filter if specified
          if (req.filter && metadata) {
            // Simple filter matching
            const matches = Object.keys(req.filter).every(key => 
              metadata[key] === req.filter[key]
            );
            if (!matches) return;
          }
          
          // Update progress
          quest.progress = Math.min(quest.progress + 1, req.count);
          
          // Check if quest completed
          if (quest.progress >= req.count) {
            const allRequirementsMet = quest.requirements.every(r => {
              if (r.type === 'daily_streak') {
                return progress.stats.daysStreak >= r.count;
              }
              return true; // Assume other requirements are met if we got here
            });
            
            if (allRequirementsMet && !quest.completed) {
              this.completeQuest(progress, quest);
            }
          }
        }
      });
    });
  }
  
  // Complete a quest
  private completeQuest(progress: UserProgress, quest: Quest): void {
    quest.completed = true;
    quest.completedAt = new Date();
    
    if (!progress.completedQuests.includes(quest.id)) {
      progress.completedQuests.push(quest.id);
      
      // Award quest XP
      this.awardXP('complete_quest', quest.reward.xp);
      
      // Award badge if specified
      if (quest.reward.badge) {
        const badge = ALL_BADGES.find(b => b.id === quest.reward.badge);
        if (badge && !progress.badges.find(b => b.id === badge.id)) {
          progress.badges.push({
            ...badge,
            unlockedAt: new Date()
          });
          this.awardXP('unlock_badge');
        }
      }
    }
  }
  
  // Check for badge unlocks based on stats
  private checkBadgeUnlocks(progress: UserProgress): void {
    ALL_BADGES.forEach(badge => {
      // Skip if already unlocked
      if (progress.badges.find(b => b.id === badge.id)) return;
      
      let shouldUnlock = false;
      
      // Check unlock conditions
      switch (badge.id) {
        case 'first-steps':
          shouldUnlock = progress.stats.publicationsViewed >= 1;
          break;
        case 'curious-explorer':
          shouldUnlock = progress.stats.publicationsViewed >= 10;
          break;
        case 'legendary-researcher':
          shouldUnlock = progress.level >= 10;
          break;
        case 'space-biologist':
          shouldUnlock = progress.stats.publicationsViewed >= 50;
          break;
        // Other badges are awarded through quests
      }
      
      if (shouldUnlock) {
        progress.badges.push({
          ...badge,
          unlockedAt: new Date()
        });
        this.awardXP('unlock_badge');
      }
    });
  }
  
  // Get active quests with progress
  getActiveQuests(): Quest[] {
    const progress = this.getUserProgress();
    return ALL_QUESTS.filter(q => 
      progress.activeQuests.includes(q.id) && !progress.completedQuests.includes(q.id)
    ).map(quest => {
      // Update progress from stats
      const updatedQuest = { ...quest };
      
      updatedQuest.requirements.forEach(req => {
        switch (req.type) {
          case 'view_publications':
            updatedQuest.progress = progress.stats.publicationsViewed;
            break;
          case 'search_queries':
            updatedQuest.progress = progress.stats.searchesMade;
            break;
          case 'chat_messages':
            updatedQuest.progress = progress.stats.chatMessages;
            break;
          case 'voice_sessions':
            updatedQuest.progress = progress.stats.voiceSessions;
            break;
          case 'identify_gaps':
            updatedQuest.progress = progress.stats.gapsIdentified;
            break;
          case 'bookmark_pubs':
            updatedQuest.progress = progress.stats.bookmarks;
            break;
          case 'daily_streak':
            updatedQuest.progress = progress.stats.daysStreak;
            break;
          case 'complete_forecast':
            updatedQuest.progress = progress.stats.forecastsCompleted;
            break;
        }
      });
      
      return updatedQuest;
    });
  }
  
  // Get completed quests
  getCompletedQuests(): Quest[] {
    const progress = this.getUserProgress();
    return ALL_QUESTS.filter(q => progress.completedQuests.includes(q.id));
  }
  
  // Get leaderboard (mock data for now - in production, would fetch from backend)
  getLeaderboard(): UserProgress[] {
    const currentUser = this.getUserProgress();
    
    // Mock leaderboard data
    const mockUsers: UserProgress[] = [
      {
        userId: 'user1',
        username: 'Dr. Sarah Chen',
        level: 15,
        xp: 0,
        totalXP: 22500,
        badges: [],
        completedQuests: [],
        activeQuests: [],
        stats: {} as any,
        achievements: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      },
      {
        userId: 'user2',
        username: 'Prof. James Miller',
        level: 14,
        xp: 0,
        totalXP: 19600,
        badges: [],
        completedQuests: [],
        activeQuests: [],
        stats: {} as any,
        achievements: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      },
      {
        userId: 'user3',
        username: 'Dr. Maria Garcia',
        level: 13,
        xp: 0,
        totalXP: 16900,
        badges: [],
        completedQuests: [],
        activeQuests: [],
        stats: {} as any,
        achievements: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      },
      {
        userId: 'user4',
        username: 'Dr. Ahmed Hassan',
        level: 12,
        xp: 0,
        totalXP: 14400,
        badges: [],
        completedQuests: [],
        activeQuests: [],
        stats: {} as any,
        achievements: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      },
      {
        userId: 'user5',
        username: 'Dr. Lisa Wong',
        level: 11,
        xp: 0,
        totalXP: 12100,
        badges: [],
        completedQuests: [],
        activeQuests: [],
        stats: {} as any,
        achievements: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      },
      currentUser
    ];
    
    // Sort by total XP
    return mockUsers.sort((a, b) => b.totalXP - a.totalXP);
  }
  
  // Update username
  updateUsername(username: string): void {
    const progress = this.getUserProgress();
    progress.username = username;
    this.saveProgress(progress);
  }
  
  // Reset progress (for testing)
  resetProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  // Generate user ID
  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const gamificationService = new GamificationService();