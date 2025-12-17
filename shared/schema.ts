import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  totalFactsMastered: integer("total_facts_mastered").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  dailyFactTime: text("daily_fact_time").default("09:00"),
  notificationTime: text("notification_time").default("09:00"),
  showOnLeaderboard: boolean("show_on_leaderboard").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Creatures table
export const creatures = pgTable("creatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull().default("Buddy"),
  stage: integer("stage").notNull().default(1), // 1=baby, 2=toddler, 3=teen
  happiness: integer("happiness").notNull().default(100), // 0-100
  health: text("health").notNull().default("happy"), // happy, neutral, sad, neglected
  personality: text("personality").default("curious"),
  lastFedAt: timestamp("last_fed_at").defaultNow(),
  lastInteractionAt: timestamp("last_interaction_at").defaultNow(),
  accessories: jsonb("accessories").$type<string[]>().default([]),
});

// Facts (learning content)
export const facts = pgTable("facts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // product_features, sales_techniques, policies, customer_service
  title: text("title").notNull(),
  content: text("content").notNull(),
  difficulty: integer("difficulty").notNull().default(1), // 1-3
});

// Flashcards (user-specific learning progress)
export const flashcards = pgTable("flashcards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  factId: varchar("fact_id").notNull().references(() => facts.id),
  confidenceLevel: integer("confidence_level").notNull().default(0), // 0-5 (Leitner box)
  nextReviewAt: timestamp("next_review_at").defaultNow(),
  lastReviewedAt: timestamp("last_reviewed_at"),
  reviewCount: integer("review_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
});

// Quizzes
export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  factId: varchar("fact_id").references(() => facts.id),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
  category: text("category").notNull(),
});

// Quiz sessions
export const quizSessions = pgTable("quiz_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  xpEarned: integer("xp_earned").notNull().default(0),
});

// User achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirement: text("requirement").notNull(),
  category: text("category").notNull(), // learning, consistency, mastery, social
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  creature: one(creatures, {
    fields: [users.id],
    references: [creatures.userId],
  }),
  flashcards: many(flashcards),
  quizSessions: many(quizSessions),
  achievements: many(userAchievements),
}));

export const creaturesRelations = relations(creatures, ({ one }) => ({
  user: one(users, {
    fields: [creatures.userId],
    references: [users.id],
  }),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  user: one(users, {
    fields: [flashcards.userId],
    references: [users.id],
  }),
  fact: one(facts, {
    fields: [flashcards.factId],
    references: [facts.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
});

export const insertCreatureSchema = createInsertSchema(creatures).pick({
  userId: true,
  name: true,
});

export const insertFactSchema = createInsertSchema(facts).pick({
  category: true,
  title: true,
  content: true,
  difficulty: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).pick({
  userId: true,
  factId: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).pick({
  userId: true,
  score: true,
  totalQuestions: true,
  xpEarned: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCreature = z.infer<typeof insertCreatureSchema>;
export type Creature = typeof creatures.$inferSelect;
export type Fact = typeof facts.$inferSelect;
export type InsertFact = z.infer<typeof insertFactSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizSession = typeof quizSessions.$inferSelect;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;

// Leaderboard entry type
export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  level: number;
  xp: number;
  totalFactsMastered: number;
  currentStreak: number;
};

// User stats type
export type UserStats = {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalFactsMastered: number;
  currentStreak: number;
  longestStreak: number;
  creatureStage: number;
  creatureHappiness: number;
  creatureHealth: string;
};
