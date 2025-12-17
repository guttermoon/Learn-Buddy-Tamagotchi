import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Settings as SettingsIcon, BookOpen, Flame, Star, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CreatureDisplay } from "@/components/creature-display";
import { XpBar } from "@/components/xp-bar";
import { StreakBadge } from "@/components/streak-badge";
import { PageLoadingSkeleton } from "@/components/loading-skeleton";
import type { User, Creature } from "@shared/schema";

export default function Profile() {
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

  const getInitials = () => {
    const name = user?.displayName || user?.username || "U";
    return name.slice(0, 2).toUpperCase();
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
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-2xl">Profile</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/settings")}
            data-testid="button-settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <Avatar className="w-20 h-20 border-4 border-lavender">
                  <AvatarFallback className="bg-gradient-to-br from-lavender to-mint text-white font-display font-bold text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1">
                  <StreakBadge streak={user?.currentStreak || 0} size="sm" />
                </div>
              </div>
              <h2 className="font-display font-bold text-xl">
                {user?.displayName || user?.username}
              </h2>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>

            <XpBar
              currentXp={currentXpProgress}
              xpToNextLevel={100}
              level={user?.level || 1}
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="font-display font-semibold text-lg mb-4">Your Buddy</h3>
          <Card className="p-6 flex flex-col items-center">
            <CreatureDisplay creature={creature || null} size="md" showSparkles />
            <div className="mt-6 text-center">
              <h4 className="font-display font-semibold text-lg">
                {creature?.name || "Buddy"}
              </h4>
              <p className="text-sm text-muted-foreground capitalize">
                {creature?.personality || "Curious"} personality
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="font-display font-semibold text-lg mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 text-center">
              <BookOpen className="w-5 h-5 text-lavender mx-auto mb-2" />
              <p className="font-display font-bold text-xl tabular-nums">
                {user?.totalFactsMastered || 0}
              </p>
              <p className="text-xs text-muted-foreground">Facts</p>
            </Card>
            <Card className="p-4 text-center">
              <Flame className="w-5 h-5 text-peach mx-auto mb-2" />
              <p className="font-display font-bold text-xl tabular-nums">
                {user?.currentStreak || 0}
              </p>
              <p className="text-xs text-muted-foreground">Streak</p>
            </Card>
            <Card className="p-4 text-center">
              <Star className="w-5 h-5 text-mint mx-auto mb-2" />
              <p className="font-display font-bold text-xl tabular-nums">
                {user?.level || 1}
              </p>
              <p className="text-xs text-muted-foreground">Level</p>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            className="w-full text-muted-foreground"
            onClick={() => setLocation("/")}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
