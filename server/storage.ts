import { 
  users, creatures, facts, flashcards, quizQuestions, quizSessions, achievements, userAchievements,
  type User, type InsertUser, type Creature, type InsertCreature, 
  type Fact, type InsertFact, type Flashcard, type InsertFlashcard,
  type QuizQuestion, type InsertQuizQuestion, type QuizSession, type InsertQuizSession,
  type Achievement, type UserAchievement,
  type LeaderboardEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  getCreature(userId: string): Promise<Creature | undefined>;
  createCreature(creature: InsertCreature): Promise<Creature>;
  updateCreature(id: string, data: Partial<Creature>): Promise<Creature | undefined>;
  
  getFacts(): Promise<Fact[]>;
  getFactsByCategory(category: string): Promise<Fact[]>;
  createFact(fact: InsertFact): Promise<Fact>;
  
  getFlashcardsForUser(userId: string): Promise<(Flashcard & { fact: Fact })[]>;
  getFlashcardsDueForReview(userId: string): Promise<(Flashcard & { fact: Fact })[]>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  updateFlashcard(id: string, data: Partial<Flashcard>): Promise<Flashcard | undefined>;
  
  getQuizQuestions(limit?: number): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getCreature(userId: string): Promise<Creature | undefined> {
    const [creature] = await db.select().from(creatures).where(eq(creatures.userId, userId));
    return creature || undefined;
  }

  async createCreature(insertCreature: InsertCreature): Promise<Creature> {
    const [creature] = await db.insert(creatures).values(insertCreature).returning();
    return creature;
  }

  async updateCreature(id: string, data: Partial<Creature>): Promise<Creature | undefined> {
    const [creature] = await db.update(creatures).set(data).where(eq(creatures.id, id)).returning();
    return creature || undefined;
  }

  async getFacts(): Promise<Fact[]> {
    return db.select().from(facts);
  }

  async getFactsByCategory(category: string): Promise<Fact[]> {
    return db.select().from(facts).where(eq(facts.category, category));
  }

  async createFact(insertFact: InsertFact): Promise<Fact> {
    const [fact] = await db.insert(facts).values(insertFact).returning();
    return fact;
  }

  async getFlashcardsForUser(userId: string): Promise<(Flashcard & { fact: Fact })[]> {
    const result = await db
      .select()
      .from(flashcards)
      .innerJoin(facts, eq(flashcards.factId, facts.id))
      .where(eq(flashcards.userId, userId))
      .orderBy(asc(flashcards.nextReviewAt));
    
    return result.map(r => ({
      ...r.flashcards,
      fact: r.facts,
    }));
  }

  async getFlashcardsDueForReview(userId: string): Promise<(Flashcard & { fact: Fact })[]> {
    const now = new Date();
    const result = await db
      .select()
      .from(flashcards)
      .innerJoin(facts, eq(flashcards.factId, facts.id))
      .where(eq(flashcards.userId, userId))
      .orderBy(asc(flashcards.nextReviewAt));
    
    return result.map(r => ({
      ...r.flashcards,
      fact: r.facts,
    }));
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const [flashcard] = await db.insert(flashcards).values(insertFlashcard).returning();
    return flashcard;
  }

  async updateFlashcard(id: string, data: Partial<Flashcard>): Promise<Flashcard | undefined> {
    const [flashcard] = await db.update(flashcards).set(data).where(eq(flashcards.id, id)).returning();
    return flashcard || undefined;
  }

  async getQuizQuestions(limit: number = 10): Promise<QuizQuestion[]> {
    return db.select().from(quizQuestions).limit(limit).orderBy(sql`RANDOM()`);
  }

  async createQuizQuestion(insertQuestion: InsertQuizQuestion): Promise<QuizQuestion> {
    const [question] = await db.insert(quizQuestions).values(insertQuestion).returning();
    return question;
  }

  async createQuizSession(insertSession: InsertQuizSession): Promise<QuizSession> {
    const [session] = await db.insert(quizSessions).values(insertSession).returning();
    return session;
  }

  async getLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const result = await db
      .select({
        userId: users.id,
        username: users.username,
        displayName: users.displayName,
        level: users.level,
        xp: users.xp,
        totalFactsMastered: users.totalFactsMastered,
        currentStreak: users.currentStreak,
      })
      .from(users)
      .where(eq(users.showOnLeaderboard, true))
      .orderBy(desc(users.xp))
      .limit(limit);

    return result.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  }

  async getAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const [ua] = await db.insert(userAchievements).values({ userId, achievementId }).returning();
    return ua;
  }
}

export const storage = new DatabaseStorage();
