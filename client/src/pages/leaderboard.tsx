import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Users, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardEntry } from "@/components/leaderboard-entry";
import { LeaderboardLoadingSkeleton } from "@/components/loading-skeleton";
import type { LeaderboardEntry as LeaderboardEntryType, User } from "@shared/schema";

export default function Leaderboard() {
  const [, setLocation] = useLocation();

  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntryType[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const topThree = leaderboard?.slice(0, 3) || [];
  const rest = leaderboard?.slice(3) || [];

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
          <h1 className="font-display font-bold text-2xl">Leaderboard</h1>
        </motion.div>

        <Tabs defaultValue="global" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="global" className="flex-1" data-testid="tab-global">
              <Globe className="w-4 h-4 mr-2" />
              Global
            </TabsTrigger>
            <TabsTrigger value="team" className="flex-1" data-testid="tab-team">
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            {isLoading ? (
              <LeaderboardLoadingSkeleton />
            ) : leaderboard && leaderboard.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {topThree.length > 0 && (
                  <Card className="p-4 mb-6">
                    <div className="space-y-3">
                      {topThree.map((entry, idx) => (
                        <motion.div
                          key={entry.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`flex items-center gap-3 p-3 rounded-xl ${
                            entry.rank === 1
                              ? "bg-xp-gold/10 ring-1 ring-xp-gold/30"
                              : entry.rank === 2
                              ? "bg-slate-400/10 ring-1 ring-slate-400/30"
                              : "bg-amber-600/10 ring-1 ring-amber-600/30"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                              entry.rank === 1
                                ? "bg-xp-gold"
                                : entry.rank === 2
                                ? "bg-slate-400"
                                : "bg-amber-600"
                            }`}
                          >
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-semibold truncate">
                              {entry.displayName || entry.username}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {entry.xp.toLocaleString()} XP
                            </p>
                          </div>
                          <div className={`text-2xl font-display font-bold ${
                            entry.rank === 1
                              ? "text-xp-gold"
                              : entry.rank === 2
                              ? "text-slate-400"
                              : "text-amber-600"
                          }`}>
                            #{entry.rank}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="divide-y">
                  {rest.map((entry, index) => (
                    <LeaderboardEntry
                      key={entry.userId}
                      entry={entry}
                      isCurrentUser={currentUser?.id === entry.userId}
                    />
                  ))}
                  {rest.length === 0 && topThree.length === 0 && (
                    <div className="p-8 text-center">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No rankings yet</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ) : (
              <Card className="p-8 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-semibold mb-2">No Rankings Yet</h3>
                <p className="text-muted-foreground">
                  Start learning to appear on the leaderboard!
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="team">
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-lavender mx-auto mb-4" />
              <h3 className="font-display font-semibold mb-2">Create or Join a Team</h3>
              <p className="text-muted-foreground mb-6">
                Compete with colleagues and track your team's progress together.
              </p>
              <Button onClick={() => setLocation("/team")} data-testid="button-create-team">
                <Plus className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
