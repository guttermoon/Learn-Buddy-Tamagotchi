import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Users, Globe } from "lucide-react";
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
            <TabsTrigger value="store" className="flex-1" data-testid="tab-store">
              <Users className="w-4 h-4 mr-2" />
              Store
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
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[1, 0, 2].map((displayIndex) => {
                      const entry = topThree[displayIndex];
                      if (!entry) return <div key={displayIndex} />;
                      
                      const isFirst = displayIndex === 0;
                      return (
                        <motion.div
                          key={entry.userId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: displayIndex * 0.1 }}
                          className={`flex flex-col items-center ${isFirst ? "order-2" : displayIndex === 1 ? "order-1" : "order-3"}`}
                        >
                          <div
                            className={`relative w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                              entry.rank === 1
                                ? "bg-xp-gold ring-4 ring-xp-gold/30"
                                : entry.rank === 2
                                ? "bg-slate-400 ring-4 ring-slate-400/30"
                                : "bg-amber-600 ring-4 ring-amber-600/30"
                            } ${isFirst ? "w-20 h-20" : ""}`}
                          >
                            <Trophy className={`text-white ${isFirst ? "w-10 h-10" : "w-6 h-6"}`} />
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              entry.rank === 1 ? "bg-xp-gold" : entry.rank === 2 ? "bg-slate-400" : "bg-amber-600"
                            }`}>
                              {entry.rank}
                            </div>
                          </div>
                          <p className="font-display font-semibold text-sm truncate max-w-full">
                            {entry.displayName || entry.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.xp.toLocaleString()} XP
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
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

          <TabsContent value="store">
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display font-semibold mb-2">Store Leaderboard</h3>
              <p className="text-muted-foreground">
                Coming soon! Compare with your store colleagues.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
