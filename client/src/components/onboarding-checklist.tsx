import { motion } from "framer-motion";
import { Check, Circle, BookOpen, Gamepad2, ShoppingBag, Trophy, Sparkles, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type OnboardingChecklistProps = {
  hasNamedCreature: boolean;
  hasCompletedFlashcard: boolean;
  hasPlayedGame: boolean;
  hasVisitedShop: boolean;
  hasViewedProgress: boolean;
  onDismiss: () => void;
};

const checklistItems = [
  {
    id: "name",
    label: "Name your buddy",
    icon: Sparkles,
    key: "hasNamedCreature" as const,
  },
  {
    id: "flashcard",
    label: "Complete a flashcard",
    icon: BookOpen,
    key: "hasCompletedFlashcard" as const,
  },
  {
    id: "game",
    label: "Play a mini-game",
    icon: Gamepad2,
    key: "hasPlayedGame" as const,
  },
  {
    id: "shop",
    label: "Visit the shop",
    icon: ShoppingBag,
    key: "hasVisitedShop" as const,
  },
  {
    id: "progress",
    label: "Check your progress",
    icon: Trophy,
    key: "hasViewedProgress" as const,
  },
];

export function OnboardingChecklist({
  hasNamedCreature,
  hasCompletedFlashcard,
  hasPlayedGame,
  hasVisitedShop,
  hasViewedProgress,
  onDismiss,
}: OnboardingChecklistProps) {
  const completedStates = {
    hasNamedCreature,
    hasCompletedFlashcard,
    hasPlayedGame,
    hasVisitedShop,
    hasViewedProgress,
  };

  const completedCount = Object.values(completedStates).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const allComplete = completedCount === totalCount;

  if (allComplete) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-4 mb-6 bg-gradient-to-br from-lavender-light/50 to-mint-light/50 dark:from-lavender/10 dark:to-mint/10 border-lavender/30">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-display font-semibold text-base">
              Getting Started
            </h3>
            <p className="text-sm text-muted-foreground">
              Complete these to learn the basics
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -mt-1 -mr-1"
            onClick={onDismiss}
            data-testid="button-dismiss-onboarding"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completedCount}/{totalCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="space-y-2">
          {checklistItems.map((item, index) => {
            const isComplete = completedStates[item.key];
            const Icon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-2 rounded-lg ${
                  isComplete
                    ? "bg-mint/10 dark:bg-mint/5"
                    : "bg-background/50"
                }`}
                data-testid={`checklist-item-${item.id}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isComplete
                      ? "bg-mint text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                </div>
                <Icon className={`w-4 h-4 shrink-0 ${
                  isComplete ? "text-mint" : "text-muted-foreground"
                }`} />
                <span
                  className={`text-sm ${
                    isComplete
                      ? "text-foreground line-through opacity-70"
                      : "text-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}
