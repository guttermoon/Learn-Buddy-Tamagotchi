import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  async function ensureDemoUser() {
    let user = await storage.getUserByUsername("demo");
    if (!user) {
      user = await storage.createUser({
        username: "demo",
        password: "demo123",
        displayName: "Learning Champion",
      });
      
      await storage.createCreature({
        userId: user.id,
        name: "Buddy",
      });
    }
    return user;
  }

  app.get("/api/user", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/creature", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      let creature = await storage.getCreature(user.id);
      
      if (!creature) {
        creature = await storage.createCreature({
          userId: user.id,
          name: "Buddy",
        });
      }
      
      const now = new Date();
      const lastInteraction = creature.lastInteractionAt ? new Date(creature.lastInteractionAt) : now;
      const hoursSinceInteraction = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
      
      let newHealth = creature.health;
      let newHappiness = creature.happiness;
      
      if (hoursSinceInteraction > 72) {
        newHealth = "neglected";
        newHappiness = Math.max(0, creature.happiness - 50);
      } else if (hoursSinceInteraction > 48) {
        newHealth = "sad";
        newHappiness = Math.max(0, creature.happiness - 30);
      } else if (hoursSinceInteraction > 24) {
        newHealth = "neutral";
        newHappiness = Math.max(0, creature.happiness - 10);
      }
      
      if (newHealth !== creature.health || newHappiness !== creature.happiness) {
        creature = await storage.updateCreature(creature.id, {
          health: newHealth,
          happiness: newHappiness,
        }) || creature;
      }
      
      res.json(creature);
    } catch (error) {
      console.error("Error fetching creature:", error);
      res.status(500).json({ message: "Failed to fetch creature" });
    }
  });

  app.post("/api/creature/feed", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      const creature = await storage.getCreature(user.id);
      
      if (!creature) {
        return res.status(404).json({ message: "Creature not found" });
      }
      
      const newHappiness = Math.min(100, creature.happiness + 15);
      const newHealth = newHappiness >= 70 ? "happy" : newHappiness >= 40 ? "neutral" : "sad";
      
      const updatedCreature = await storage.updateCreature(creature.id, {
        happiness: newHappiness,
        health: newHealth,
        lastFedAt: new Date(),
        lastInteractionAt: new Date(),
      });
      
      await storage.updateUser(user.id, {
        xp: user.xp + 5,
      });
      
      res.json(updatedCreature);
    } catch (error) {
      console.error("Error feeding creature:", error);
      res.status(500).json({ message: "Failed to feed creature" });
    }
  });

  app.get("/api/flashcards", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      let flashcards = await storage.getFlashcardsForUser(user.id);
      
      if (flashcards.length === 0) {
        const allFacts = await storage.getFacts();
        const factsToAdd = allFacts.slice(0, 10);
        
        for (const fact of factsToAdd) {
          await storage.createFlashcard({
            userId: user.id,
            factId: fact.id,
          });
        }
        
        flashcards = await storage.getFlashcardsForUser(user.id);
      }
      
      res.json(flashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  app.post("/api/flashcards/review", async (req, res) => {
    try {
      const { flashcardId, correct } = req.body;
      const user = await ensureDemoUser();
      
      const flashcards = await storage.getFlashcardsForUser(user.id);
      const flashcard = flashcards.find(f => f.id === flashcardId);
      
      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      
      const intervals = [1, 2, 4, 8, 16, 32];
      let newConfidence = flashcard.confidenceLevel;
      
      if (correct) {
        newConfidence = Math.min(5, flashcard.confidenceLevel + 1);
      } else {
        newConfidence = Math.max(0, flashcard.confidenceLevel - 1);
      }
      
      const daysUntilNext = intervals[newConfidence] || 1;
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysUntilNext);
      
      await storage.updateFlashcard(flashcard.id, {
        confidenceLevel: newConfidence,
        nextReviewAt: nextReview,
        lastReviewedAt: new Date(),
        reviewCount: flashcard.reviewCount + 1,
        correctCount: correct ? flashcard.correctCount + 1 : flashcard.correctCount,
      });
      
      const xpEarned = correct ? 10 : 2;
      const creature = await storage.getCreature(user.id);
      
      if (creature) {
        const happinessBonus = correct ? 5 : 1;
        await storage.updateCreature(creature.id, {
          happiness: Math.min(100, creature.happiness + happinessBonus),
          health: "happy",
          lastInteractionAt: new Date(),
        });
      }
      
      const newTotalFacts = correct && newConfidence >= 3 
        ? user.totalFactsMastered + 1 
        : user.totalFactsMastered;
      
      await storage.updateUser(user.id, {
        xp: user.xp + xpEarned,
        totalFactsMastered: newTotalFacts,
        level: Math.floor((user.xp + xpEarned) / 100) + 1,
      });
      
      res.json({ success: true, xpEarned, newConfidence });
    } catch (error) {
      console.error("Error reviewing flashcard:", error);
      res.status(500).json({ message: "Failed to review flashcard" });
    }
  });

  app.get("/api/quiz/questions", async (req, res) => {
    try {
      const questions = await storage.getQuizQuestions(5);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const { score, totalQuestions } = req.body;
      const user = await ensureDemoUser();
      
      const baseXp = score * 10;
      const bonusXp = score === totalQuestions ? 25 : 0;
      const xpEarned = baseXp + bonusXp;
      
      await storage.createQuizSession({
        userId: user.id,
        score,
        totalQuestions,
        xpEarned,
      });
      
      const creature = await storage.getCreature(user.id);
      if (creature) {
        const happinessBonus = Math.min(20, score * 3);
        await storage.updateCreature(creature.id, {
          happiness: Math.min(100, creature.happiness + happinessBonus),
          health: "happy",
          lastFedAt: new Date(),
          lastInteractionAt: new Date(),
        });
      }
      
      const newXp = user.xp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      await storage.updateUser(user.id, {
        xp: newXp,
        level: newLevel,
        totalFactsMastered: user.totalFactsMastered + score,
        currentStreak: user.currentStreak + 1,
        longestStreak: Math.max(user.longestStreak, user.currentStreak + 1),
        lastActiveDate: new Date().toISOString().split('T')[0],
      });
      
      if (creature && newLevel > user.level) {
        const newStage = newLevel >= 6 ? 3 : newLevel >= 3 ? 2 : 1;
        if (newStage > creature.stage) {
          await storage.updateCreature(creature.id, { stage: newStage });
        }
      }
      
      res.json({ success: true, xpEarned, newLevel });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/facts", async (req, res) => {
    try {
      const allFacts = await storage.getFacts();
      res.json(allFacts);
    } catch (error) {
      console.error("Error fetching facts:", error);
      res.status(500).json({ message: "Failed to fetch facts" });
    }
  });

  return httpServer;
}
