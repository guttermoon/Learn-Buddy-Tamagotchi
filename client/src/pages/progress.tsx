import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Flame, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { XpBar } from "@/components/xp-bar";
import { EvolutionTimeline } from "@/components/evolution-timeline";
import { CreatureDisplay } from "@/components/creature-display";
import { StatsLoadingSkeleton, PageLoadingSkeleton } from "@/components/loading-skeleton";
import type { User, Creature } from "@shared/schema";

export default function Progress() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: creature, isLoading: creatureLoading } = useQuery<Creature>({
    queryKey: ["/api/creature"],
  });

  const isLoading = userLoading || creatureLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <PageLoadingSkeleton />
        </div>
      </div>
    );
  }

  const xpToNextLevel = user ? (user.level + 1) * 100 : 100;
  const currentXpProgress = user ? user.xp % 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-2xl">Your Progress</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center gap-6">
              <CreatureDisplay creature={creature || null} size="sm" />
              <div className="flex-1">
                <h2 className="font-display font-semibold text-xl mb-2">
                  {creature?.name || "Buddy"}
                </h2>
                <XpBar
                  currentXp={currentXpProgress}
                  xpToNextLevel={100}
                  level={user?.level || 1}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {user?.xp || 0} total XP earned
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="font-display font-semibold text-lg mb-4">Evolution Progress</h3>
          <Card className="p-4">
            <EvolutionTimeline
              currentStage={creature?.stage || 1}
              totalFactsMastered={user?.totalFactsMastered || 0}
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="font-display font-semibold text-lg mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={BookOpen}
              label="Facts Mastered"
              value={user?.totalFactsMastered || 0}
              color="lavender"
            />
            <StatCard
              icon={Flame}
              label="Current Streak"
              value={user?.currentStreak || 0}
              subtext="days"
              color="peach"
            />
            <StatCard
              icon={Star}
              label="Longest Streak"
              value={user?.longestStreak || 0}
              subtext="days"
              color="mint"
            />
            <StatCard
              icon={Trophy}
              label="Level"
              value={user?.level || 1}
              color="sky"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-display font-semibold text-lg mb-4">Achievements</h3>
          <Card className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="font-display font-semibold mb-2">Coming Soon</h4>
            <p className="text-sm text-muted-foreground">
              Achievements will be available in the next update!
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
