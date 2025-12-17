import { motion } from "framer-motion";
import { Sparkles, BookOpen, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: "Virtual Buddy",
      description: "Care for your learning companion as it evolves with your knowledge",
    },
    {
      icon: BookOpen,
      title: "Smart Flashcards",
      description: "Master retail skills with spaced repetition learning",
    },
    {
      icon: Trophy,
      title: "Achievements",
      description: "Earn XP, unlock badges, and level up your expertise",
    },
    {
      icon: Users,
      title: "Leaderboard",
      description: "Compete with colleagues and climb the ranks",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-lavender" />
          <span className="font-display text-xl font-bold">Learn Buddy</span>
        </div>
        <Button
          onClick={() => window.location.href = "/api/login"}
          data-testid="button-login"
        >
          Sign In
        </Button>
      </header>

      <main className="flex-1">
        <section className="py-16 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Learn Retail Skills the <span className="text-lavender">Fun Way</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Transform your training into an engaging adventure with a virtual companion 
              that grows alongside your knowledge.
            </p>
            <Button
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-get-started"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </motion.div>
        </section>

        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-center mb-8">
              Why Learn Buddy?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <feature.icon className="w-10 h-10 text-lavender mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-display text-2xl font-bold mb-4">
              Ready to start learning?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join your team and begin your learning journey today.
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-join"
            >
              Sign In to Continue
            </Button>
          </motion.div>
        </section>
      </main>

      <footer className="p-6 border-t text-center text-sm text-muted-foreground">
        <p>Learn Buddy - Gamified Learning for Retail Teams</p>
      </footer>
    </div>
  );
}
