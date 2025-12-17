import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Trophy, Flame, BookOpen, Crown, Star, Zap, Award, Heart, Sparkles, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type AchievementWithStatus = {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  category: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
};

const iconMap: Record<string, typeof Trophy> = {
  trophy: Trophy,
  flame: Flame,
  fire: Flame,
  "book-open": BookOpen,
  library: BookOpen,
  crown: Crown,
  star: Star,
  zap: Zap,
  award: Award,
  medal: Award,
  heart: Heart,
  sparkles: Sparkles,
  gem: Gem,
  baby: Star,
  egg: Star,
  sprout: Sparkles,
  smile: Heart,
  gamepad: Zap,
  "check-circle": Award,
};

const categoryColors: Record<string, string> = {
  learning: "bg-sky text-white",
  mastery: "bg-xp-gold text-white",
  consistency: "bg-peach text-white",
  evolution: "bg-lavender text-white",
  care: "bg-mint text-white",
};

export default function Achievements() {
  const [, setLocation] = useLocation();

  const { data: achievements, isLoading } = useQuery<AchievementWithStatus[]>({
    queryKey: ["/api/achievements"],
  });

  const unlockedCount = achievements?.filter((a) => a.isUnlocked).length || 0;
  const totalCount = achievements?.length || 0;

  const groupedAchievements = achievements?.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, AchievementWithStatus[]>);

  const categoryLabels: Record<string, string> = {
    learning: "Learning",
    mastery: "Mastery",
    consistency: "Consistency",
    evolution: "Evolution",
    care: "Care",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/progress")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-2xl">Achievements</h1>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {unlockedCount}/{totalCount}
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="font-display font-semibold">
                {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <Progress value={totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0} className="h-3" />
          </Card>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedAchievements && Object.entries(groupedAchievements).map(([category, categoryAchievements], catIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + catIndex * 0.05 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={categoryColors[category] || "bg-muted"}>
                    {categoryLabels[category] || category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {categoryAchievements.filter(a => a.isUnlocked).length}/{categoryAchievements.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {categoryAchievements.map((achievement, index) => {
                    const IconComponent = iconMap[achievement.icon] || Trophy;
                    
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 + index * 0.03 }}
                      >
                        <Card 
                          className={`p-4 ${
                            achievement.isUnlocked 
                              ? "bg-gradient-to-br from-xp-gold/10 to-lavender/10 border-xp-gold/30" 
                              : "bg-muted/50"
                          }`}
                          data-testid={`achievement-${achievement.id}`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                              achievement.isUnlocked 
                                ? "bg-xp-gold/20 text-xp-gold" 
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {achievement.isUnlocked ? (
                                <IconComponent className="w-6 h-6" />
                              ) : (
                                <Lock className="w-5 h-5" />
                              )}
                            </div>
                            <h4 className={`font-display font-semibold text-sm mb-1 ${
                              achievement.isUnlocked ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {achievement.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            {!achievement.isUnlocked && achievement.maxProgress > 1 && (
                              <div className="w-full">
                                <Progress 
                                  value={(achievement.progress / achievement.maxProgress) * 100} 
                                  className="h-1.5 mb-1" 
                                />
                                <span className="text-[10px] text-muted-foreground">
                                  {achievement.progress}/{achievement.maxProgress}
                                </span>
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
