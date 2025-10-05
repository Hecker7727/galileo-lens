import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { 
  Trophy, 
  Award, 
  Target, 
  Zap, 
  TrendingUp, 
  Star,
  Crown,
  Sparkles,
  Users,
  Medal,
  Lock,
  CheckCircle2,
  Circle,
  Flame,
  Calendar,
  BookOpen,
  MessageSquare,
  Mic,
  Search,
  Bookmark,
  Share2,
  Activity
} from 'lucide-react';
import {
  gamificationService,
  UserProgress,
  Quest,
  Badge as BadgeType,
  calculateLevel,
  getLevelProgress,
  getXPForLevel,
  ALL_QUESTS
} from '../services/gamificationService';

export default function GamificationPage() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProgress[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const progress = gamificationService.getUserProgress();
    setUserProgress(progress);
    setNewUsername(progress.username);
    
    const active = gamificationService.getActiveQuests();
    setActiveQuests(active);
    
    const completed = gamificationService.getCompletedQuests();
    setCompletedQuests(completed);
    
    const leaders = gamificationService.getLeaderboard();
    setLeaderboard(leaders);
  };

  const handleUsernameUpdate = () => {
    if (newUsername.trim()) {
      gamificationService.updateUsername(newUsername.trim());
      loadProgress();
      setEditingUsername(false);
    }
  };

  if (!userProgress) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Zap className="h-12 w-12 text-yellow-500 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress(userProgress.totalXP);
  const userRank = leaderboard.findIndex(u => u.userId === userProgress.userId) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Research Explorer Dashboard
          </h1>
          <p className="text-muted-foreground">Track your journey through NASA's bioscience research</p>
        </div>

        {/* User Stats Card */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl backdrop-blur-sm shadow-lg"
                >
                  {userProgress.level >= 10 ? '👑' : userProgress.level >= 5 ? '⭐' : '🚀'}
                </motion.div>
                <div>
                  {editingUsername ? (
                    <div className="flex gap-2">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                        placeholder="Enter username"
                        onKeyPress={(e) => e.key === 'Enter' && handleUsernameUpdate()}
                      />
                      <Button size="sm" variant="secondary" onClick={handleUsernameUpdate}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/20" onClick={() => setEditingUsername(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <h2 
                      className="text-3xl font-bold cursor-pointer hover:opacity-80 transition-opacity text-white"
                      onClick={() => setEditingUsername(true)}
                    >
                      {userProgress.username}
                    </h2>
                  )}
                  <p className="text-sm opacity-90 text-white">Research Explorer</p>
                </div>
              </div>
              
              <div className="text-right text-white">
                <div className="text-5xl font-bold text-white">Level {userProgress.level}</div>
                <div className="text-sm opacity-90 text-white">Global Rank: #{userRank}</div>
              </div>
            </div>
            
            <div className="space-y-2 text-white">
              <div className="flex justify-between text-sm text-white">
                <span className="text-white">{levelProgress.current} / {levelProgress.needed} XP</span>
                <span className="text-white">{Math.round(levelProgress.percentage)}%</span>
              </div>
              <div className="relative">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-white rounded-full shadow-lg"
                  />
                </div>
              </div>
              <p className="text-xs opacity-90 text-center text-white">
                {levelProgress.needed - levelProgress.current} XP to Level {userProgress.level + 1}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/30">
              <StatBadge icon={BookOpen} label="Publications" value={userProgress.stats.publicationsViewed} />
              <StatBadge icon={Search} label="Searches" value={userProgress.stats.searchesMade} />
              <StatBadge icon={MessageSquare} label="Chat Messages" value={userProgress.stats.chatMessages} />
              <StatBadge icon={Flame} label="Day Streak" value={userProgress.stats.daysStreak} />
              <StatBadge icon={Trophy} label="Badges" value={userProgress.badges.length} />
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="quests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger value="quests" className="flex items-center gap-2 py-3">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Quests</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2 py-3">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2 py-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2 py-3">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Quests Tab */}
          <TabsContent value="quests" className="space-y-6">
            <QuestsSection activeQuests={activeQuests} completedQuests={completedQuests} />
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <BadgesSection badges={userProgress.badges} />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <LeaderboardSection leaderboard={leaderboard} currentUserId={userProgress.userId} />
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <StatsSection stats={userProgress.stats} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// Stat Badge Component
function StatBadge({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="text-center text-white">
      <Icon className="h-5 w-5 mx-auto mb-1 opacity-90" />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs opacity-90">{label}</div>
    </div>
  );
}

// Quests Section
function QuestsSection({ activeQuests, completedQuests }: { activeQuests: Quest[]; completedQuests: Quest[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Quests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Active Quests
          </CardTitle>
          <CardDescription>Complete these to earn XP and badges</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {activeQuests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active quests. Check back soon for new challenges!
                </p>
              ) : (
                activeQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Completed Quests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Completed Quests
          </CardTitle>
          <CardDescription>Your achievements ({completedQuests.length})</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {completedQuests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Complete your first quest to see it here!
                </p>
              ) : (
                completedQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} completed />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Quest Card Component
function QuestCard({ quest, completed = false }: { quest: Quest; completed?: boolean }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exploration': return <BookOpen className="h-4 w-4" />;
      case 'discovery': return <Sparkles className="h-4 w-4" />;
      case 'contribution': return <Share2 className="h-4 w-4" />;
      case 'challenge': return <Zap className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const progressPercentage = (quest.progress / quest.total) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`p-4 border-2 rounded-lg transition-all ${
        completed 
          ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' 
          : 'border-blue-200 bg-white dark:bg-gray-800 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {completed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              getTypeIcon(quest.type)
            )}
            <h4 className="font-bold">{quest.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{quest.description}</p>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {getTypeIcon(quest.type)}
              <span className="ml-1 capitalize">{quest.type}</span>
            </Badge>
            <Badge className={`text-xs text-white ${getDifficultyColor(quest.difficulty)}`}>
              {quest.difficulty}
            </Badge>
          </div>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-yellow-600">{quest.reward.xp}</div>
          <div className="text-xs text-muted-foreground">XP</div>
        </div>
      </div>

      {!completed && (
        <>
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{quest.progress} / {quest.total}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </>
      )}

      {completed && quest.completedAt && (
        <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed {new Date(quest.completedAt).toLocaleDateString()}
        </div>
      )}
    </motion.div>
  );
}

// Badges Section
function BadgesSection({ badges }: { badges: BadgeType[] }) {
  const unlockedBadges = badges;
  const totalBadges = 15; // Update based on ALL_BADGES length
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-yellow-600" />
                Badge Collection
              </CardTitle>
              <CardDescription>
                {unlockedBadges.length} / {totalBadges} badges unlocked
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600">
                {Math.round((unlockedBadges.length / totalBadges) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {unlockedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} unlocked />
            ))}
            {Array.from({ length: totalBadges - unlockedBadges.length }).map((_, i) => (
              <BadgeCard key={`locked-${i}`} badge={null} unlocked={false} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Badge Card Component
function BadgeCard({ badge, unlocked }: { badge: BadgeType | null; unlocked: boolean }) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (!unlocked) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="relative p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center aspect-square"
      >
        <Lock className="h-8 w-8 text-gray-400 mb-2" />
        <span className="text-xs text-gray-400">Locked</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`relative p-4 rounded-lg bg-gradient-to-br ${getRarityColor(badge?.rarity || 'common')} text-white flex flex-col items-center justify-center aspect-square cursor-pointer shadow-lg`}
    >
      <div className="text-5xl mb-2">{badge?.icon}</div>
      <div className="text-center">
        <div className="text-xs font-bold">{badge?.name}</div>
        <Badge variant="secondary" className="text-[10px] mt-1 capitalize">
          {badge?.rarity}
        </Badge>
      </div>
      {badge?.unlockedAt && (
        <div className="absolute top-1 right-1">
          <Sparkles className="h-3 w-3" />
        </div>
      )}
    </motion.div>
  );
}

// Leaderboard Section
function LeaderboardSection({ leaderboard, currentUserId }: { leaderboard: UserProgress[]; currentUserId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          Global Leaderboard
        </CardTitle>
        <CardDescription>Top researchers on Galileo's Lenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <LeaderboardEntry 
              key={user.userId}
              user={user}
              rank={index + 1}
              isCurrentUser={user.userId === currentUserId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Leaderboard Entry
function LeaderboardEntry({ user, rank, isCurrentUser }: { user: UserProgress; rank: number; isCurrentUser: boolean }) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-orange-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
        isCurrentUser 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 bg-white dark:bg-gray-800 hover:border-blue-300'
      }`}
    >
      <div className="w-12 flex justify-center">
        {getRankIcon(rank)}
      </div>
      
      <div className="flex-1">
        <div className="font-bold flex items-center gap-2">
          {user.username}
          {isCurrentUser && <Badge variant="secondary" className="text-xs">You</Badge>}
        </div>
        <div className="text-sm text-muted-foreground">
          Level {user.level} • {user.badges.length} badges
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-2xl font-bold text-purple-600">{user.totalXP.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">Total XP</div>
      </div>
    </motion.div>
  );
}

// Stats Section
function StatsSection({ stats }: { stats: UserProgress['stats'] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard 
        icon={BookOpen}
        title="Publications Viewed"
        value={stats.publicationsViewed}
        color="blue"
        description="Research papers you've explored"
      />
      <StatCard 
        icon={Search}
        title="Searches Made"
        value={stats.searchesMade}
        color="green"
        description="Queries across the dataset"
      />
      <StatCard 
        icon={MessageSquare}
        title="Chat Messages"
        value={stats.chatMessages}
        color="purple"
        description="Conversations with Galileo AI"
      />
      <StatCard 
        icon={Mic}
        title="Voice Sessions"
        value={stats.voiceSessions}
        color="pink"
        description="Voice interactions completed"
      />
      <StatCard 
        icon={Target}
        title="Gaps Identified"
        value={stats.gapsIdentified}
        color="orange"
        description="Research opportunities found"
      />
      <StatCard 
        icon={Bookmark}
        title="Bookmarks"
        value={stats.bookmarks}
        color="yellow"
        description="Saved publications"
      />
      <StatCard 
        icon={Flame}
        title="Day Streak"
        value={stats.daysStreak}
        color="red"
        description="Consecutive days active"
      />
      <StatCard 
        icon={Share2}
        title="Insights Shared"
        value={stats.insightsShared}
        color="indigo"
        description="Knowledge contributed"
      />
      <StatCard 
        icon={Activity}
        title="Forecasts Completed"
        value={stats.forecastsCompleted}
        color="teal"
        description="Health risk analyses"
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, title, value, color, description }: { 
  icon: any; 
  title: string; 
  value: number; 
  color: string;
  description: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    orange: 'from-orange-500 to-orange-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
    teal: 'from-teal-500 to-teal-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white mb-4`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="text-4xl font-bold mb-2">{value.toLocaleString()}</div>
          <div className="font-medium text-sm mb-1">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}