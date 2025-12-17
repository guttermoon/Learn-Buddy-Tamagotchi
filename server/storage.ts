import { 
  users, creatures, facts, flashcards, quizQuestions, quizSessions, achievements, userAchievements,
  accessories, userAccessories, teams, teamMembers, teamContributions,
  accessoryGifts, accessoryTrades,
  type User, type InsertUser, type Creature, type InsertCreature, 
  type Fact, type InsertFact, type Flashcard, type InsertFlashcard,
  type QuizQuestion, type InsertQuizQuestion, type QuizSession, type InsertQuizSession,
  type Achievement, type UserAchievement,
  type Accessory, type InsertAccessory, type UserAccessory, type InsertUserAccessory,
  type Team, type InsertTeam, type TeamMember, type InsertTeamMember,
  type TeamContribution, type InsertTeamContribution, type TeamLeaderboardEntry,
  type LeaderboardEntry,
  type AccessoryGift, type InsertAccessoryGift,
  type AccessoryTrade, type InsertAccessoryTrade
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, lte, sql, and } from "drizzle-orm";

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
  
  getAccessories(): Promise<Accessory[]>;
  getUserAccessories(userId: string): Promise<(UserAccessory & { accessory: Accessory })[]>;
  purchaseAccessory(userId: string, accessoryId: string): Promise<UserAccessory>;
  equipAccessory(userAccessoryId: string, equipped: boolean): Promise<UserAccessory | undefined>;
  getAccessory(id: string): Promise<Accessory | undefined>;
  unequipAccessoriesByCategory(userId: string, category: string): Promise<void>;
  getEquippedAccessories(userId: string): Promise<(UserAccessory & { accessory: Accessory })[]>;
  
  // Team methods
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamByCode(code: string): Promise<Team | undefined>;
  updateTeam(id: string, data: Partial<Team>): Promise<Team | undefined>;
  getUserTeams(userId: string): Promise<Team[]>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: string, userId: string): Promise<void>;
  getTeamMembers(teamId: string): Promise<(TeamMember & { user: User })[]>;
  isTeamMember(teamId: string, userId: string): Promise<boolean>;
  addTeamContribution(contribution: InsertTeamContribution): Promise<TeamContribution>;
  getTeamContributions(teamId: string): Promise<TeamLeaderboardEntry[]>;
  getUserTeamContribution(teamId: string, userId: string): Promise<number>;
  
  // Gift methods
  createGift(gift: InsertAccessoryGift): Promise<AccessoryGift>;
  getGift(id: string): Promise<AccessoryGift | undefined>;
  getPendingGiftsForUser(userId: string): Promise<(AccessoryGift & { accessory: Accessory; sender: User })[]>;
  getSentGifts(userId: string): Promise<(AccessoryGift & { accessory: Accessory; recipient: User })[]>;
  updateGiftStatus(id: string, status: string): Promise<AccessoryGift | undefined>;
  transferAccessoryOwnership(userAccessoryId: string, newUserId: string): Promise<UserAccessory | undefined>;
  getUserAccessory(id: string): Promise<(UserAccessory & { accessory: Accessory }) | undefined>;
  
  // Trade methods
  createTrade(trade: InsertAccessoryTrade): Promise<AccessoryTrade>;
  getTrade(id: string): Promise<AccessoryTrade | undefined>;
  getPendingTradesForUser(userId: string): Promise<(AccessoryTrade & { proposerAccessory: Accessory; recipientAccessory: Accessory; proposer: User })[]>;
  getSentTrades(userId: string): Promise<(AccessoryTrade & { proposerAccessory: Accessory; recipientAccessory: Accessory; recipient: User })[]>;
  updateTradeStatus(id: string, status: string): Promise<AccessoryTrade | undefined>;
  
  // User search
  searchUsers(query: string, excludeUserId: string): Promise<User[]>;
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
    const [question] = await db.insert(quizQuestions).values({
      ...insertQuestion,
      options: insertQuestion.options as string[],
    }).returning();
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
      userId: entry.userId,
      username: entry.username || "Anonymous",
      displayName: entry.displayName,
      level: entry.level,
      xp: entry.xp,
      totalFactsMastered: entry.totalFactsMastered,
      currentStreak: entry.currentStreak,
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

  async getAccessories(): Promise<Accessory[]> {
    return db.select().from(accessories);
  }

  async getAccessory(id: string): Promise<Accessory | undefined> {
    const [accessory] = await db.select().from(accessories).where(eq(accessories.id, id));
    return accessory || undefined;
  }

  async getUserAccessories(userId: string): Promise<(UserAccessory & { accessory: Accessory })[]> {
    const result = await db
      .select()
      .from(userAccessories)
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
      .where(eq(userAccessories.userId, userId));
    
    return result.map(r => ({
      ...r.user_accessories,
      accessory: r.accessories,
    }));
  }

  async purchaseAccessory(userId: string, accessoryId: string): Promise<UserAccessory> {
    const [ua] = await db.insert(userAccessories).values({ userId, accessoryId }).returning();
    return ua;
  }

  async equipAccessory(userAccessoryId: string, equipped: boolean): Promise<UserAccessory | undefined> {
    const [ua] = await db.update(userAccessories).set({ equipped }).where(eq(userAccessories.id, userAccessoryId)).returning();
    return ua || undefined;
  }

  async unequipAccessoriesByCategory(userId: string, category: string): Promise<void> {
    const userAccs = await this.getUserAccessories(userId);
    const toUnequip = userAccs.filter(ua => ua.accessory.category === category && ua.equipped);
    for (const acc of toUnequip) {
      await db.update(userAccessories).set({ equipped: false }).where(eq(userAccessories.id, acc.id));
    }
  }

  async getEquippedAccessories(userId: string): Promise<(UserAccessory & { accessory: Accessory })[]> {
    const userAccs = await this.getUserAccessories(userId);
    return userAccs.filter(ua => ua.equipped);
  }

  // Team methods
  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getTeamByCode(code: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.code, code));
    return team || undefined;
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team | undefined> {
    const [team] = await db.update(teams).set(data).where(eq(teams.id, id)).returning();
    return team || undefined;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const result = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));
    return result.map(r => r.team);
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [tm] = await db.insert(teamMembers).values(member).returning();
    return tm;
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await db.delete(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
  }

  async getTeamMembers(teamId: string): Promise<(TeamMember & { user: User })[]> {
    const result = await db
      .select()
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));
    return result.map(r => ({
      ...r.team_members,
      user: r.users,
    }));
  }

  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const [member] = await db.select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    return !!member;
  }

  async addTeamContribution(contribution: InsertTeamContribution): Promise<TeamContribution> {
    const [tc] = await db.insert(teamContributions).values(contribution).returning();
    return tc;
  }

  async getTeamContributions(teamId: string): Promise<TeamLeaderboardEntry[]> {
    const result = await db
      .select({
        userId: teamContributions.userId,
        username: users.username,
        displayName: users.displayName,
        totalContributed: sql<number>`SUM(${teamContributions.xpContributed})::int`,
      })
      .from(teamContributions)
      .innerJoin(users, eq(teamContributions.userId, users.id))
      .where(eq(teamContributions.teamId, teamId))
      .groupBy(teamContributions.userId, users.username, users.displayName)
      .orderBy(desc(sql`SUM(${teamContributions.xpContributed})`));

    return result.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: entry.username || "Anonymous",
      displayName: entry.displayName,
      totalContributed: entry.totalContributed || 0,
    }));
  }

  async getUserTeamContribution(teamId: string, userId: string): Promise<number> {
    const [result] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${teamContributions.xpContributed}), 0)::int`,
      })
      .from(teamContributions)
      .where(and(eq(teamContributions.teamId, teamId), eq(teamContributions.userId, userId)));
    return result?.total || 0;
  }

  // Gift methods
  async createGift(gift: InsertAccessoryGift): Promise<AccessoryGift> {
    const [newGift] = await db.insert(accessoryGifts).values(gift).returning();
    return newGift;
  }

  async getGift(id: string): Promise<AccessoryGift | undefined> {
    const [gift] = await db.select().from(accessoryGifts).where(eq(accessoryGifts.id, id));
    return gift || undefined;
  }

  async getPendingGiftsForUser(userId: string): Promise<(AccessoryGift & { accessory: Accessory; sender: User })[]> {
    const result = await db
      .select()
      .from(accessoryGifts)
      .innerJoin(userAccessories, eq(accessoryGifts.userAccessoryId, userAccessories.id))
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
      .innerJoin(users, eq(accessoryGifts.senderUserId, users.id))
      .where(and(eq(accessoryGifts.recipientUserId, userId), eq(accessoryGifts.status, "pending")));
    return result.map(r => ({
      ...r.accessory_gifts,
      accessory: r.accessories,
      sender: r.users,
    }));
  }

  async getSentGifts(userId: string): Promise<(AccessoryGift & { accessory: Accessory; recipient: User })[]> {
    const result = await db
      .select()
      .from(accessoryGifts)
      .innerJoin(userAccessories, eq(accessoryGifts.userAccessoryId, userAccessories.id))
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
      .innerJoin(users, eq(accessoryGifts.recipientUserId, users.id))
      .where(eq(accessoryGifts.senderUserId, userId));
    return result.map(r => ({
      ...r.accessory_gifts,
      accessory: r.accessories,
      recipient: r.users,
    }));
  }

  async updateGiftStatus(id: string, status: string): Promise<AccessoryGift | undefined> {
    const [gift] = await db.update(accessoryGifts)
      .set({ status, resolvedAt: new Date() })
      .where(eq(accessoryGifts.id, id))
      .returning();
    return gift || undefined;
  }

  async transferAccessoryOwnership(userAccessoryId: string, newUserId: string): Promise<UserAccessory | undefined> {
    const [updated] = await db.update(userAccessories)
      .set({ userId: newUserId, equipped: false })
      .where(eq(userAccessories.id, userAccessoryId))
      .returning();
    return updated || undefined;
  }

  async getUserAccessory(id: string): Promise<(UserAccessory & { accessory: Accessory }) | undefined> {
    const [result] = await db
      .select()
      .from(userAccessories)
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
      .where(eq(userAccessories.id, id));
    if (!result) return undefined;
    return {
      ...result.user_accessories,
      accessory: result.accessories,
    };
  }

  // Trade methods
  async createTrade(trade: InsertAccessoryTrade): Promise<AccessoryTrade> {
    const [newTrade] = await db.insert(accessoryTrades).values(trade).returning();
    return newTrade;
  }

  async getTrade(id: string): Promise<AccessoryTrade | undefined> {
    const [trade] = await db.select().from(accessoryTrades).where(eq(accessoryTrades.id, id));
    return trade || undefined;
  }

  async getPendingTradesForUser(userId: string): Promise<(AccessoryTrade & { proposerAccessory: Accessory; recipientAccessory: Accessory; proposer: User })[]> {
    const proposerAccs = db.$with('proposer_accs').as(
      db.select({
        tradeId: accessoryTrades.id,
        accessoryId: accessories.id,
        accessoryName: accessories.name,
        accessoryIcon: accessories.icon,
        accessoryRarity: accessories.rarity,
      })
      .from(accessoryTrades)
      .innerJoin(userAccessories, eq(accessoryTrades.proposerAccessoryId, userAccessories.id))
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
    );

    const result = await db
      .select()
      .from(accessoryTrades)
      .innerJoin(userAccessories, eq(accessoryTrades.recipientAccessoryId, userAccessories.id))
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
      .innerJoin(users, eq(accessoryTrades.proposerUserId, users.id))
      .where(and(eq(accessoryTrades.recipientUserId, userId), eq(accessoryTrades.status, "pending")));

    const trades = [];
    for (const r of result) {
      const [proposerAcc] = await db
        .select()
        .from(userAccessories)
        .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
        .where(eq(userAccessories.id, r.accessory_trades.proposerAccessoryId));
      
      trades.push({
        ...r.accessory_trades,
        proposerAccessory: proposerAcc?.accessories || {} as Accessory,
        recipientAccessory: r.accessories,
        proposer: r.users,
      });
    }
    return trades;
  }

  async getSentTrades(userId: string): Promise<(AccessoryTrade & { proposerAccessory: Accessory; recipientAccessory: Accessory; recipient: User })[]> {
    const result = await db
      .select()
      .from(accessoryTrades)
      .innerJoin(userAccessories, eq(accessoryTrades.proposerAccessoryId, userAccessories.id))
      .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
      .innerJoin(users, eq(accessoryTrades.recipientUserId, users.id))
      .where(eq(accessoryTrades.proposerUserId, userId));

    const trades = [];
    for (const r of result) {
      const [recipientAcc] = await db
        .select()
        .from(userAccessories)
        .innerJoin(accessories, eq(userAccessories.accessoryId, accessories.id))
        .where(eq(userAccessories.id, r.accessory_trades.recipientAccessoryId));
      
      trades.push({
        ...r.accessory_trades,
        proposerAccessory: r.accessories,
        recipientAccessory: recipientAcc?.accessories || {} as Accessory,
        recipient: r.users,
      });
    }
    return trades;
  }

  async updateTradeStatus(id: string, status: string): Promise<AccessoryTrade | undefined> {
    const [trade] = await db.update(accessoryTrades)
      .set({ status, resolvedAt: new Date() })
      .where(eq(accessoryTrades.id, id))
      .returning();
    return trade || undefined;
  }

  // User search
  async searchUsers(query: string, excludeUserId: string): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .where(sql`${users.username} ILIKE ${`%${query}%`} AND ${users.id} != ${excludeUserId}`)
      .limit(10);
    return result;
  }
}

export const storage = new DatabaseStorage();
