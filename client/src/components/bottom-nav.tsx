import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, BookOpen, BarChart3, Trophy, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Learn", path: "/learn" },
  { icon: BarChart3, label: "Progress", path: "/progress" },
  { icon: Trophy, label: "Ranks", path: "/leaderboard" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-50">
      <div className="max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path !== "/" && location.startsWith(item.path));

            return (
              <motion.button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center gap-1 px-2 sm:px-4 py-2 rounded-xl transition-colors min-w-[48px] sm:min-w-[64px] ${
                  isActive
                    ? "text-lavender"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileTap={{ scale: 0.95 }}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-lavender rounded-full"
                    />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
