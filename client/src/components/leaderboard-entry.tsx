import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { LeaderboardEntry as LeaderboardEntryType } from "@shared/schema";

type LeaderboardEntryProps = {
  entry: LeaderboardEntryType;
  isCurrentUser?: boolean;
};

export function LeaderboardEntry({ entry, isCurrentUser = false }: LeaderboardEntryProps) {
  const getRankDisplay = () => {
    if (entry.rank === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-xp-gold flex items-center justify-center">
          <Trophy className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (entry.rank === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center">
          <Medal className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (entry.rank === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
          <Medal className="w-4 h-4 text-white" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <span className="text-sm font-semibold text-muted-foreground tabular-nums">
          {entry.rank}
        </span>
      </div>
    );
  };

  const getInitials = () => {
    const name = entry.displayName || entry.username;
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <motion.div
      className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
        isCurrentUser
          ? "bg-lavender-light dark:bg-lavender/20 ring-2 ring-lavender"
          : "hover:bg-muted/50"
      }`}
      whileHover={{ x: 4 }}
      data-testid={`leaderboard-entry-${entry.rank}`}
    >
      {getRankDisplay()}

      <Avatar className="w-10 h-10 border-2 border-background">
        <AvatarFallback className="bg-gradient-to-br from-lavender to-mint text-white font-display font-semibold text-sm">
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold truncate">
          {entry.displayName || entry.username}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-lavender">(You)</span>
          )}
        </p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Lv. {entry.level}</span>
          <span className="text-xs">|</span>
          <span>{entry.totalFactsMastered} facts</span>
        </div>
      </div>

      <div className="text-right">
        <p className="font-display font-bold text-lg text-lavender tabular-nums">
          {entry.xp.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">XP</p>
      </div>
    </motion.div>
  );
}
