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
      let user = await ensureDemoUser();
      
      // Check for daily login streak
      const today = new Date().toISOString().split('T')[0];
      const lastActive = user.lastActiveDate;
      
      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        let newStreak = user.currentStreak;
        let xpBonus = 0;
        
        if (lastActive === yesterdayStr) {
          // Consecutive day login - increase streak
          newStreak = user.currentStreak + 1;
          xpBonus = 5; // 5 XP daily login reward
        } else if (!lastActive || lastActive < yesterdayStr) {
          // Streak broken - reset to 1
          newStreak = 1;
          xpBonus = 5; // Still get XP for logging in
        }
        
        const newXp = user.xp + xpBonus;
        const newLevel = Math.floor(newXp / 100) + 1;
        
        user = await storage.updateUser(user.id, {
          lastActiveDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
          xp: newXp,
          level: newLevel,
        }) || user;
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  function getStageFromFacts(factsMastered: number): number {
    const thresholds = [0, 101, 301, 601, 1001];
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (factsMastered >= thresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  }

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
      
      // Calculate stage based on user's facts mastered
      const newStage = getStageFromFacts(user.totalFactsMastered);
      
      if (newHealth !== creature.health || newHappiness !== creature.happiness || newStage !== creature.stage) {
        creature = await storage.updateCreature(creature.id, {
          health: newHealth,
          happiness: newHappiness,
          stage: newStage,
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

  app.patch("/api/creature/rename", async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ message: "Name is required" });
      }
      
      if (name.length > 20) {
        return res.status(400).json({ message: "Name must be 20 characters or less" });
      }
      
      const user = await ensureDemoUser();
      const creature = await storage.getCreature(user.id);
      
      if (!creature) {
        return res.status(404).json({ message: "Creature not found" });
      }
      
      const updatedCreature = await storage.updateCreature(creature.id, {
        name: name.trim(),
      });
      
      res.json(updatedCreature);
    } catch (error) {
      console.error("Error renaming creature:", error);
      res.status(500).json({ message: "Failed to rename creature" });
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
      const coinsEarned = correct ? 2 : 0;
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
      
      const newXp = user.xp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      await storage.updateUser(user.id, {
        xp: newXp,
        totalFactsMastered: newTotalFacts,
        level: newLevel,
        coins: user.coins + coinsEarned,
      });
      
      // Check for evolution based on facts mastered
      if (newTotalFacts > user.totalFactsMastered && creature) {
        const newStage = getStageFromFacts(newTotalFacts);
        if (newStage > creature.stage) {
          await storage.updateCreature(creature.id, { stage: newStage });
        }
      }
      
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
      const coinsEarned = score * 5 + (score === totalQuestions ? 10 : 0);
      
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
        coins: user.coins + coinsEarned,
      });
      
      const newTotalFacts = user.totalFactsMastered + score;
      if (creature) {
        // Evolution based on facts mastered using 5-stage thresholds
        const newStage = getStageFromFacts(newTotalFacts);
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

  app.get("/api/daily-fact", async (req, res) => {
    try {
      const allFacts = await storage.getFacts();
      if (allFacts.length === 0) {
        return res.status(404).json({ message: "No facts available" });
      }
      
      // Get a "random" fact based on the current day
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const factIndex = dayOfYear % allFacts.length;
      
      res.json(allFacts[factIndex]);
    } catch (error) {
      console.error("Error fetching daily fact:", error);
      res.status(500).json({ message: "Failed to fetch daily fact" });
    }
  });

  app.get("/api/achievements", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      const allAchievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(user.id);
      const creature = await storage.getCreature(user.id);
      
      // Check which achievements should be unlocked
      const achievementsWithStatus = allAchievements.map((achievement) => {
        const isUnlocked = userAchievements.some((ua) => ua.achievementId === achievement.id);
        let progress = 0;
        let maxProgress = 1;
        
        if (achievement.requirement.startsWith("facts_")) {
          maxProgress = parseInt(achievement.requirement.split("_")[1]);
          progress = Math.min(user.totalFactsMastered, maxProgress);
        } else if (achievement.requirement.startsWith("streak_")) {
          maxProgress = parseInt(achievement.requirement.split("_")[1]);
          progress = Math.min(user.longestStreak, maxProgress);
        } else if (achievement.requirement.startsWith("stage_")) {
          maxProgress = parseInt(achievement.requirement.split("_")[1]);
          progress = Math.min(creature?.stage || 1, maxProgress);
        }
        
        return {
          ...achievement,
          isUnlocked,
          progress,
          maxProgress,
        };
      });
      
      res.json(achievementsWithStatus);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.post("/api/minigame/complete", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      const { score } = req.body;
      
      const xpEarned = Math.max(10, Math.min(100, score || 50));
      const coinsEarned = Math.floor(xpEarned / 5);
      
      const updatedUser = await storage.updateUser(user.id, {
        xp: user.xp + xpEarned,
        coins: user.coins + coinsEarned,
      });
      
      // Update creature interaction
      const creature = await storage.getCreature(user.id);
      if (creature) {
        const newHappiness = Math.min(100, creature.happiness + 10);
        await storage.updateCreature(creature.id, {
          happiness: newHappiness,
          health: newHappiness >= 70 ? "happy" : newHappiness >= 40 ? "neutral" : "sad",
          lastInteractionAt: new Date(),
        });
      }
      
      res.json({ xpEarned, newTotal: updatedUser?.xp });
    } catch (error) {
      console.error("Error completing minigame:", error);
      res.status(500).json({ message: "Failed to complete minigame" });
    }
  });

  app.get("/api/user/settings", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      res.json({
        notificationTime: user.notificationTime || "09:00",
        showOnLeaderboard: user.showOnLeaderboard ?? true,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/user/settings", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      const { notificationTime, showOnLeaderboard } = req.body;
      
      const updatedUser = await storage.updateUser(user.id, {
        ...(notificationTime !== undefined && { notificationTime }),
        ...(showOnLeaderboard !== undefined && { showOnLeaderboard }),
      });
      
      res.json({
        notificationTime: updatedUser?.notificationTime || "09:00",
        showOnLeaderboard: updatedUser?.showOnLeaderboard ?? true,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Accessory Shop routes
  app.get("/api/shop/accessories", async (req, res) => {
    try {
      const allAccessories = await storage.getAccessories();
      res.json(allAccessories);
    } catch (error) {
      console.error("Error fetching accessories:", error);
      res.status(500).json({ message: "Failed to fetch accessories" });
    }
  });

  app.get("/api/shop/owned", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      const owned = await storage.getUserAccessories(user.id);
      res.json(owned);
    } catch (error) {
      console.error("Error fetching owned accessories:", error);
      res.status(500).json({ message: "Failed to fetch owned accessories" });
    }
  });

  app.post("/api/shop/purchase", async (req, res) => {
    try {
      const { accessoryId } = req.body;
      const user = await ensureDemoUser();
      
      const accessory = await storage.getAccessory(accessoryId);
      if (!accessory) {
        return res.status(404).json({ message: "Accessory not found" });
      }
      
      if (user.coins < accessory.price) {
        return res.status(400).json({ message: "Not enough coins" });
      }
      
      // Check if already owned
      const owned = await storage.getUserAccessories(user.id);
      if (owned.some(o => o.accessoryId === accessoryId)) {
        return res.status(400).json({ message: "Already owned" });
      }
      
      // Deduct coins and purchase
      await storage.updateUser(user.id, {
        coins: user.coins - accessory.price,
      });
      
      const purchase = await storage.purchaseAccessory(user.id, accessoryId);
      res.json({ success: true, purchase, newBalance: user.coins - accessory.price });
    } catch (error) {
      console.error("Error purchasing accessory:", error);
      res.status(500).json({ message: "Failed to purchase accessory" });
    }
  });

  app.post("/api/shop/equip", async (req, res) => {
    try {
      const { userAccessoryId, equipped } = req.body;
      const user = await ensureDemoUser();
      
      // Get the accessory to find its category
      const owned = await storage.getUserAccessories(user.id);
      const userAcc = owned.find(o => o.id === userAccessoryId);
      if (!userAcc) {
        return res.status(404).json({ message: "Accessory not found" });
      }
      
      // If equipping, first unequip other accessories in the same category
      if (equipped) {
        await storage.unequipAccessoriesByCategory(user.id, userAcc.accessory.category);
      }
      
      const result = await storage.equipAccessory(userAccessoryId, equipped);
      res.json({ success: true, accessory: result });
    } catch (error) {
      console.error("Error equipping accessory:", error);
      res.status(500).json({ message: "Failed to equip accessory" });
    }
  });

  app.get("/api/shop/equipped", async (req, res) => {
    try {
      const user = await ensureDemoUser();
      const equipped = await storage.getEquippedAccessories(user.id);
      res.json(equipped);
    } catch (error) {
      console.error("Error fetching equipped accessories:", error);
      res.status(500).json({ message: "Failed to fetch equipped accessories" });
    }
  });

  return httpServer;
}
