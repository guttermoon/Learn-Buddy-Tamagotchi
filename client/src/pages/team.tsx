import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Plus, Copy, Trophy, Crown, LogOut, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CreatureDisplay, getStageFromFacts } from "@/components/creature-display";
import { PageLoadingSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Team, TeamLeaderboardEntry, TeamMember, User } from "@shared/schema";

const stageThresholds = [0, 500, 2000, 5000, 10000];
const stageNames = ["Baby", "Toddler", "Teen", "Adult", "Master"];

function getNextStageXp(stage: number): number {
  if (stage >= 5) return stageThresholds[4];
  return stageThresholds[stage];
}

function TeamCreature({ team }: { team: Team }) {
  const stage = team.creatureStage || 1;
  const currentXp = team.totalXp || 0;
  const nextStageXp = getNextStageXp(stage);
  const prevStageXp = stage > 1 ? stageThresholds[stage - 1] : 0;
  const progress = stage >= 5 ? 100 : ((currentXp - prevStageXp) / (nextStageXp - prevStageXp)) * 100;

  const mockCreature = {
    id: team.id,
    userId: team.creatorId,
    name: team.creatureName,
    stage: stage,
    happiness: 100,
    health: "happy" as const,
    personality: "team-spirit",
    lastFedAt: new Date(),
    lastInteractionAt: new Date(),
    accessories: [],
  };

  return (
    <Card className="p-6 text-center">
      <div className="mb-4">
        <CreatureDisplay creature={mockCreature} size="lg" showSparkles />
      </div>
      <h2 className="font-display font-bold text-xl mb-1">{team.creatureName}</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Stage {stage}: {stageNames[stage - 1]}
      </p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Team XP</span>
          <span className="font-semibold tabular-nums">{currentXp.toLocaleString()}</span>
        </div>
        <Progress value={progress} className="h-3" />
        {stage < 5 && (
          <p className="text-xs text-muted-foreground">
            {(nextStageXp - currentXp).toLocaleString()} XP to next stage
          </p>
        )}
      </div>
    </Card>
  );
}

function ContributionLeaderboard({ teamId }: { teamId: string }) {
  const { data: leaderboard, isLoading } = useQuery<TeamLeaderboardEntry[]>({
    queryKey: ["/api/teams", teamId, "leaderboard"],
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (!leaderboard?.length) {
    return (
      <Card className="p-6 text-center">
        <Trophy className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No contributions yet</p>
        <p className="text-sm text-muted-foreground">
          Complete activities to contribute XP!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-xp-gold" />
        Top Contributors
      </h3>
      <div className="space-y-3">
        {leaderboard.map((entry) => (
          <div
            key={entry.userId}
            className="flex items-center gap-3 p-2 rounded-lg"
            data-testid={`leaderboard-entry-${entry.userId}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              entry.rank === 1 ? "bg-xp-gold/20 text-xp-gold" :
              entry.rank === 2 ? "bg-muted text-muted-foreground" :
              entry.rank === 3 ? "bg-peach/20 text-peach" :
              "bg-muted text-muted-foreground"
            }`}>
              {entry.rank}
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-lavender/20">
                {(entry.displayName || entry.username).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {entry.displayName || entry.username}
              </p>
            </div>
            <span className="font-display font-bold text-lavender tabular-nums">
              {entry.totalContributed.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamMembers({ teamId, creatorId }: { teamId: string; creatorId: string }) {
  const { data: members, isLoading } = useQuery<(TeamMember & { user: User })[]>({
    queryKey: ["/api/teams", teamId, "members"],
  });

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded" />;
  }

  return (
    <Card className="p-4">
      <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-mint" />
        Team Members ({members?.length || 0})
      </h3>
      <div className="space-y-2">
        {members?.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-2"
            data-testid={`member-${member.userId}`}
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-mint/20">
                {(member.user.displayName || member.user.username || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {member.user.displayName || member.user.username}
              </p>
            </div>
            {member.userId === creatorId && (
              <Crown className="w-4 h-4 text-xp-gold" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamView({ team }: { team: Team }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const leaveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/teams/${team.id}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Left team successfully" });
    },
  });

  const copyCode = () => {
    navigator.clipboard.writeText(team.code);
    toast({ title: "Team code copied!" });
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display font-bold text-xl truncate">{team.name}</h2>
            <p className="text-sm text-muted-foreground">
              Join code: <span className="font-mono font-bold">{team.code}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyCode}
            data-testid="button-copy-code"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <TeamCreature team={team} />

      <Tabs defaultValue="leaderboard">
        <TabsList className="w-full">
          <TabsTrigger value="leaderboard" className="flex-1" data-testid="tab-leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-1" data-testid="tab-members">
            <Users className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaderboard" className="mt-4">
          <ContributionLeaderboard teamId={team.id} />
        </TabsContent>
        <TabsContent value="members" className="mt-4">
          <TeamMembers teamId={team.id} creatorId={team.creatorId} />
        </TabsContent>
      </Tabs>

      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground text-center mb-3">
          Complete learning activities to contribute XP to your team creature!
        </p>
        <Button 
          className="w-full" 
          onClick={() => setLocation("/learn")}
          data-testid="button-start-learning"
        >
          Start Learning
        </Button>
      </Card>
    </div>
  );
}

function NoTeamView() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creatureName, setCreatureName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/teams", { 
        name: teamName, 
        creatureName: creatureName || "Team Buddy" 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setCreateOpen(false);
      setTeamName("");
      setCreatureName("");
      toast({ title: "Team created!" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to create team", variant: "destructive" });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/teams/join", { code: joinCode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setJoinOpen(false);
      setJoinCode("");
      toast({ title: "Joined team!" });
    },
    onError: (err: any) => {
      toast({ title: "Invalid team code", variant: "destructive" });
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-lavender to-mint flex items-center justify-center">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">Join a Team</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          Work together with friends to level up a shared creature!
        </p>
      </motion.div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" data-testid="button-create-team">
              <Plus className="w-4 h-4 mr-2" />
              Create a Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  data-testid="input-team-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Creature Name (optional)</label>
                <Input
                  value={creatureName}
                  onChange={(e) => setCreatureName(e.target.value)}
                  placeholder="Team Buddy"
                  data-testid="input-creature-name"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createMutation.mutate()}
                disabled={!teamName || createMutation.isPending}
                data-testid="button-confirm-create"
              >
                {createMutation.isPending ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" data-testid="button-join-team">
              <Share2 className="w-4 h-4 mr-2" />
              Join with Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Team Code</label>
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  className="font-mono text-center text-lg tracking-widest"
                  data-testid="input-join-code"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => joinMutation.mutate()}
                disabled={joinCode.length !== 6 || joinMutation.isPending}
                data-testid="button-confirm-join"
              >
                {joinMutation.isPending ? "Joining..." : "Join Team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [, setLocation] = useLocation();

  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <PageLoadingSkeleton />
        </div>
      </div>
    );
  }

  const hasTeam = teams && teams.length > 0;
  const currentTeam = hasTeam ? teams[0] : null;

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
          <h1 className="font-display font-bold text-2xl">Team Creature</h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {currentTeam ? (
            <motion.div
              key="team"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TeamView team={currentTeam} />
            </motion.div>
          ) : (
            <motion.div
              key="no-team"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <NoTeamView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
