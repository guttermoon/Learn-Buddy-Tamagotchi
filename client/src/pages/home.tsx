import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Utensils, Gamepad2, Sparkles, AlertTriangle, Coins, ShoppingBag } from "lucide-react";
import { CreatureDisplay } from "@/components/creature-display";
import { HappinessMeter } from "@/components/happiness-meter";
import { XpBar } from "@/components/xp-bar";
import { StreakBadge } from "@/components/streak-badge";
import { ActionButton } from "@/components/action-button";
import { DailyFactCard } from "@/components/daily-fact-card";
import { CreatureLoadingSkeleton } from "@/components/loading-skeleton";
import { RenameDialog } from "@/components/rename-dialog";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, Creature, Accessory, UserAccessory } from "@shared/schema";

type OnboardingState = {
  hasNamedCreature: boolean;
  hasCompletedFlashcard: boolean;
  hasPlayedGame: boolean;
  hasVisitedShop: boolean;
  hasViewedProgress: boolean;
  dismissed: boolean;
};

const defaultOnboarding: OnboardingState = {
  hasNamedCreature: false,
  hasCompletedFlashcard: false,
  hasPlayedGame: false,
  hasVisitedShop: false,
  hasViewedProgress: false,
  dismissed: false,
};

function getOnboardingState(): OnboardingState {
  try {
    const stored = localStorage.getItem("learnbuddy_onboarding");
    if (stored) {
      return { ...defaultOnboarding, ...JSON.parse(stored) };
    }
  } catch {}
  return defaultOnboarding;
}

function saveOnboardingState(state: OnboardingState) {
  try {
    localStorage.setItem("learnbuddy_onboarding", JSON.stringify(state));
  } catch {}
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [isFeeding, setIsFeeding] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingState>(getOnboardingState);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: creature, isLoading: creatureLoading } = useQuery<Creature>({
    queryKey: ["/api/creature"],
  });

  const { data: equippedAccessories = [] } = useQuery<(UserAccessory & { accessory: Accessory })[]>({
    queryKey: ["/api/shop/equipped"],
  });

  useEffect(() => {
    if (creature && creature.name !== "Buddy") {
      updateOnboarding({ hasNamedCreature: true });
    }
  }, [creature?.name]);

  useEffect(() => {
    if (user && user.totalFactsMastered > 0) {
      updateOnboarding({ hasCompletedFlashcard: true });
    }
  }, [user?.totalFactsMastered]);

  const updateOnboarding = (updates: Partial<OnboardingState>) => {
    setOnboarding(prev => {
      const newState = { ...prev, ...updates };
      saveOnboardingState(newState);
      return newState;
    });
  };

  const handleDismissOnboarding = () => {
    updateOnboarding({ dismissed: true });
  };

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
              <CreatureDisplay
                  creature={creature || null}
                  size="lg"
                  showSparkles={Boolean(creature?.happiness && creature.happiness >= 80)}
                  isFeeding={isFeeding}
                  equippedAccessories={equippedAccessories}
                  hideNameLabel
                />

              {creature && (
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-1">
                    <h2 className="font-display text-xl font-bold">{creature.name}</h2>
                    <RenameDialog currentName={creature.name} />
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center gap-3">
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

        {!onboarding.dismissed && (
          <OnboardingChecklist
            hasNamedCreature={onboarding.hasNamedCreature}
            hasCompletedFlashcard={onboarding.hasCompletedFlashcard}
            hasPlayedGame={onboarding.hasPlayedGame}
            hasVisitedShop={onboarding.hasVisitedShop}
            hasViewedProgress={onboarding.hasViewedProgress}
            onDismiss={handleDismissOnboarding}
          />
        )}

        {creature?.health === "neglected" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-destructive/10 border-destructive/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="font-display font-semibold text-destructive mb-1">
                    Your buddy needs help!
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {creature.name || "Buddy"} has been feeling lonely. Complete 3 flashcards or a quiz to restore their happiness!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-display font-semibold text-lg mb-4 text-center">
              Take Care of {creature?.name || "Your Buddy"}
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
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
                onClick={() => {
                  updateOnboarding({ hasPlayedGame: true });
                  setLocation("/match");
                }}
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

          <DailyFactCard onClick={() => setLocation("/learn")} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-2 gap-4"
        >
          <Card 
            className="p-4 text-center hover-elevate cursor-pointer"
            onClick={() => {
              updateOnboarding({ hasViewedProgress: true });
              setLocation("/progress");
            }}
            data-testid="card-facts-mastered"
          >
            <p className="text-3xl font-display font-bold text-lavender tabular-nums">
              {user?.totalFactsMastered || 0}
            </p>
            <p className="text-sm text-muted-foreground">Facts Mastered</p>
          </Card>
          <Card 
            className="p-4 text-center hover-elevate cursor-pointer"
            onClick={() => {
              updateOnboarding({ hasVisitedShop: true });
              setLocation("/shop");
            }}
            data-testid="card-coins"
          >
            <div className="flex items-center justify-center gap-1">
              <Coins className="w-6 h-6 text-xp-gold" />
              <p className="text-3xl font-display font-bold text-xp-gold tabular-nums">
                {user?.coins || 0}
              </p>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              Shop
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
