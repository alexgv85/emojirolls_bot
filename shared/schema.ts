import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  telegramId: text("telegram_id").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Gifts/NFTs table
export const gifts = pgTable("gifts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  icon: text("icon").notNull(),
  type: text("type").notNull(),
  skin: text("skin"),
  background: text("background"),
  rarity: text("rarity").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  isInGame: boolean("is_in_game").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PvP Games table
export const pvpGames = pgTable("pvp_games", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("waiting"), // waiting, spinning, completed
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull().default("0"),
  winnerId: integer("winner_id").references(() => users.id),
  gameHash: text("game_hash").notNull(),
  countdownEnds: timestamp("countdown_ends"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// PvP Game Participants table
export const pvpParticipants = pgTable("pvp_participants", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => pvpGames.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  giftId: integer("gift_id").references(() => gifts.id).notNull(),
  winChance: decimal("win_chance", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Roll Sessions table
export const rollSessions = pgTable("roll_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  quantity: integer("quantity").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  results: jsonb("results").notNull(), // Array of gift results
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: integer("reward").notNull(), // Free rolls
  type: text("type").notNull(), // share, join_channel, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Task Completions table
export const userTaskCompletions = pgTable("user_task_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Referrals table
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id).notNull(),
  referredId: integer("referred_id").references(() => users.id).notNull(),
  totalEarned: decimal("total_earned", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Staking table
export const staking = pgTable("staking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  giftId: integer("gift_id").references(() => gifts.id).notNull(),
  stakedAt: timestamp("staked_at").defaultNow().notNull(),
  lastRewardClaimed: timestamp("last_reward_claimed").defaultNow().notNull(),
});

// Shop Items table
export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  icon: text("icon").notNull(),
  type: text("type").notNull(),
  skin: text("skin"),
  background: text("background"),
  rarity: text("rarity").notNull(),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGiftSchema = createInsertSchema(gifts).omit({
  id: true,
  createdAt: true,
});

export const insertPvpGameSchema = createInsertSchema(pvpGames).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertPvpParticipantSchema = createInsertSchema(pvpParticipants).omit({
  id: true,
  createdAt: true,
});

export const insertRollSessionSchema = createInsertSchema(rollSessions).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertUserTaskCompletionSchema = createInsertSchema(userTaskCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertStakingSchema = createInsertSchema(staking).omit({
  id: true,
  stakedAt: true,
  lastRewardClaimed: true,
});

export const insertShopItemSchema = createInsertSchema(shopItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Gift = typeof gifts.$inferSelect;
export type InsertGift = z.infer<typeof insertGiftSchema>;

export type PvpGame = typeof pvpGames.$inferSelect;
export type InsertPvpGame = z.infer<typeof insertPvpGameSchema>;

export type PvpParticipant = typeof pvpParticipants.$inferSelect;
export type InsertPvpParticipant = z.infer<typeof insertPvpParticipantSchema>;

export type RollSession = typeof rollSessions.$inferSelect;
export type InsertRollSession = z.infer<typeof insertRollSessionSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type UserTaskCompletion = typeof userTaskCompletions.$inferSelect;
export type InsertUserTaskCompletion = z.infer<typeof insertUserTaskCompletionSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type Staking = typeof staking.$inferSelect;
export type InsertStaking = z.infer<typeof insertStakingSchema>;

export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = z.infer<typeof insertShopItemSchema>;

// Extended types for API responses
export type PvpGameWithParticipants = PvpGame & {
  participants: (PvpParticipant & { user: User; gift: Gift })[];
};

export type UserWithStats = User & {
  totalStaked: string;
  dailyRewards: string;
  referralCount: number;
  referralEarnings: string;
  rank: number;
};
