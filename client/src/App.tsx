import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { SeasonalAnimations } from "@/components/seasonal-animations";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Learn from "@/pages/learn";
import Quiz from "@/pages/quiz";
import Progress from "@/pages/progress";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import MatchGame from "@/pages/match-game";
import Achievements from "@/pages/achievements";
import Shop from "@/pages/shop";
import Team from "@/pages/team";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/learn" component={Learn} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/progress" component={Progress} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/match" component={MatchGame} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/shop" component={Shop} />
      <Route path="/team" component={Team} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-lavender" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="fixed top-0 right-0 z-50 p-4">
        <ThemeToggle />
      </header>
      <main>
        <AuthenticatedRouter />
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SeasonalAnimations />
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
