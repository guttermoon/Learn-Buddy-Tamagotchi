import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Utensils, Gamepad2, Sparkles, BookOpen } from "lucide-react";
import { CreatureDisplay } from "@/components/creature-display";
import { HappinessMeter } from "@/components/happiness-meter";
import { XpBar } from "@/components/xp-bar";
import { StreakBadge } from "@/components/streak-badge";
import { ActionButton } from "@/components/action-button";
import { CreatureLoadingSkeleton } from "@/components/loading-skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Creature } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isFeeding, setIsFeeding] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: creature, isLoading: creatureLoading } = useQuery<Creature>({
    queryKey: ["/api/creature"],
  });

  const feedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/creature/feed"),
    onMutate: () => setIsFeeding(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creature"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setTimeout(() => setIsFeeding(false), 600);
    },
    onError: () => setIsFeeding(false),
  });

  const isLoading = userLoading || creatureLoading;

  const xpToNextLevel = user ? (user.level + 1) * 100 : 100;
  const currentXpProgress = user ? user.xp % 100 : 0;

  const getHealthStatus = () => {
    if (!creature) return { text: "Unknown", color: "text-muted-foreground" };
    switch (creature.health) {
      case "happy":
        return { text: "Feeling Great!", color: "text-mint" };
      case "neutral":
        return { text: "Doing Okay", color: "text-foreground" };
      case "sad":
        return { text: "Needs Attention", color: "text-peach" };
      case "neglected":
        return { text: "Feeling Lonely", color: "text-destructive" };
      default:
        return { text: "Unknown", color: "text-muted-foreground" };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-lavender-light/20 to-background dark:from-background dark:via-lavender/5 dark:to-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex-1">
            {user && (
              <XpBar
                currentXp={currentXpProgress}
                xpToNextLevel={100}
                level={user.level}
              />
            )}
          </div>
          <div className="ml-4">
            <StreakBadge streak={user?.currentStreak || 0} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center mb-8"
        >
          {isLoading ? (
            <CreatureLoadingSkeleton />
          ) : (
            <>
              <div className="relative">
                <CreatureDisplay
                  creature={creature || null}
                  size="lg"
                  showSparkles={creature?.happiness && creature.happiness >= 80}
                  isFeeding={isFeeding}
                />
              </div>

              <div className="mt-12 flex flex-col items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`${healthStatus.color} border-current`}
                >
                  {healthStatus.text}
                </Badge>
                <HappinessMeter value={creature?.happiness || 0} size="md" />
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-display font-semibold text-lg mb-4 text-center">
              Take Care of {creature?.name || "Your Buddy"}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <ActionButton
                icon={Utensils}
                label="Feed"
                onClick={() => setLocation("/learn")}
                variant="primary"
                testId="button-feed"
              />
              <ActionButton
                icon={Gamepad2}
                label="Play"
                onClick={() => setLocation("/quiz")}
                variant="secondary"
                testId="button-play"
              />
              <ActionButton
                icon={Sparkles}
                label="Care"
                onClick={() => feedMutation.mutate()}
                variant="accent"
                disabled={feedMutation.isPending}
                testId="button-care"
              />
            </div>
          </Card>

          <Card 
            className="p-4 hover-elevate cursor-pointer"
            onClick={() => setLocation("/learn")}
            data-testid="card-daily-fact"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-light dark:bg-sky/20 rounded-xl">
                <BookOpen className="w-6 h-6 text-sky" />
              </div>
              <div className="flex-1">
                <h4 className="font-display font-semibold">Daily Fact</h4>
                <p className="text-sm text-muted-foreground">
                  Learn something new today!
                </p>
              </div>
              <Badge className="bg-sky text-white">New</Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-2 gap-4"
        >
          <Card 
            className="p-4 text-center hover-elevate cursor-pointer"
            onClick={() => setLocation("/progress")}
            data-testid="card-facts-mastered"
          >
            <p className="text-3xl font-display font-bold text-lavender tabular-nums">
              {user?.totalFactsMastered || 0}
            </p>
            <p className="text-sm text-muted-foreground">Facts Mastered</p>
          </Card>
          <Card 
            className="p-4 text-center hover-elevate cursor-pointer"
            onClick={() => setLocation("/leaderboard")}
            data-testid="card-your-rank"
          >
            <p className="text-3xl font-display font-bold text-mint tabular-nums">
              #{user?.level || 1}
            </p>
            <p className="text-sm text-muted-foreground">Your Level</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
