import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Import and re-export auth models
import { users, sessions } from "./models/auth";
export { users, sessions };
export type { User, UpsertUser } from "./models/auth";

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

// Accessories shop
export const accessories = pgTable("accessories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // hat, glasses, necklace, background
  price: integer("price").notNull(),
  icon: text("icon").notNull(),
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary
});

export const userAccessories = pgTable("user_accessories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accessoryId: varchar("accessory_id").notNull().references(() => accessories.id),
  equipped: boolean("equipped").notNull().default(false),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// Teams for shared creature
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(), // Join code for team
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  creatureName: text("creature_name").notNull().default("Team Buddy"),
  creatureStage: integer("creature_stage").notNull().default(1),
  totalXp: integer("total_xp").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team members
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default("member"), // creator, admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Team contributions (tracks XP contributions to team creature)
export const teamContributions = pgTable("team_contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  xpContributed: integer("xp_contributed").notNull().default(0),
  contributedAt: timestamp("contributed_at").defaultNow(),
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

export const insertAccessorySchema = createInsertSchema(accessories).omit({
  id: true,
});

export const insertUserAccessorySchema = createInsertSchema(userAccessories).pick({
  userId: true,
  accessoryId: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  code: true,
  creatorId: true,
  creatureName: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  teamId: true,
  userId: true,
  role: true,
});

export const insertTeamContributionSchema = createInsertSchema(teamContributions).pick({
  teamId: true,
  userId: true,
  xpContributed: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
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
export type Accessory = typeof accessories.$inferSelect;
export type InsertAccessory = z.infer<typeof insertAccessorySchema>;
export type UserAccessory = typeof userAccessories.$inferSelect;
export type InsertUserAccessory = z.infer<typeof insertUserAccessorySchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamContribution = typeof teamContributions.$inferSelect;
export type InsertTeamContribution = z.infer<typeof insertTeamContributionSchema>;

// Team leaderboard entry
export type TeamLeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  totalContributed: number;
};

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
