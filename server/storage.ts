import { 
  users, gifts, pvpGames, pvpParticipants, rollSessions, tasks, 
  userTaskCompletions, referrals, staking, shopItems,
  type User, type InsertUser, type Gift, type InsertGift,
  type PvpGame, type InsertPvpGame, type PvpParticipant, type InsertPvpParticipant,
  type RollSession, type InsertRollSession, type Task, type InsertTask,
  type UserTaskCompletion, type InsertUserTaskCompletion,
  type Referral, type InsertReferral, type Staking, type InsertStaking,
  type ShopItem, type InsertShopItem, type PvpGameWithParticipants, type UserWithStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sum, and, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, balance: string): Promise<void>;
  getUserStats(id: number): Promise<UserWithStats | undefined>;
  getLeaderboard(): Promise<UserWithStats[]>;

  // Gifts
  getGift(id: number): Promise<Gift | undefined>;
  getUserGifts(userId: number): Promise<Gift[]>;
  createGift(gift: InsertGift): Promise<Gift>;
  updateGiftOwner(id: number, ownerId: number | null): Promise<void>;
  setGiftInGame(id: number, inGame: boolean): Promise<void>;

  // PvP Games
  getCurrentPvpGame(): Promise<PvpGameWithParticipants | undefined>;
  createPvpGame(game: InsertPvpGame): Promise<PvpGame>;
  addPvpParticipant(participant: InsertPvpParticipant): Promise<PvpParticipant>;
  completePvpGame(gameId: number, winnerId: number): Promise<void>;
  getPvpGameHistory(limit: number): Promise<PvpGameWithParticipants[]>;

  // Rolls
  createRollSession(session: InsertRollSession): Promise<RollSession>;
  getRollHistory(userId: number, limit: number): Promise<RollSession[]>;
  getRecentRolls(limit: number): Promise<(RollSession & { user: User })[]>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getUserCompletedTasks(userId: number): Promise<UserTaskCompletion[]>;
  completeTask(completion: InsertUserTaskCompletion): Promise<UserTaskCompletion>;

  // Referrals
  createReferral(referral: InsertReferral): Promise<Referral>;
  getUserReferrals(userId: number): Promise<Referral[]>;
  updateReferralEarnings(referrerId: number, amount: string): Promise<void>;

  // Staking
  stakeGift(staking: InsertStaking): Promise<Staking>;
  unstakeGift(giftId: number): Promise<void>;
  getUserStaking(userId: number): Promise<(Staking & { gift: Gift })[]>;
  claimStakingRewards(userId: number): Promise<void>;

  // Shop
  getShopItems(): Promise<ShopItem[]>;
  getShopItem(id: number): Promise<ShopItem | undefined>;
  purchaseShopItem(userId: number, itemId: number): Promise<Gift>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gifts: Map<number, Gift>;
  private pvpGames: Map<number, PvpGame>;
  private pvpParticipants: Map<number, PvpParticipant>;
  private rollSessions: Map<number, RollSession>;
  private tasks: Map<number, Task>;
  private userTaskCompletions: Map<number, UserTaskCompletion>;
  private referrals: Map<number, Referral>;
  private staking: Map<number, Staking>;
  private shopItems: Map<number, ShopItem>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.gifts = new Map();
    this.pvpGames = new Map();
    this.pvpParticipants = new Map();
    this.rollSessions = new Map();
    this.tasks = new Map();
    this.userTaskCompletions = new Map();
    this.referrals = new Map();
    this.staking = new Map();
    this.shopItems = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Initialize default tasks
    this.tasks.set(1, {
      id: 1,
      title: "Share the app",
      description: "Share RollsClone with friends",
      reward: 1,
      type: "share",
      isActive: true,
      createdAt: new Date(),
    });

    this.tasks.set(2, {
      id: 2,
      title: "Join our channel",
      description: "Follow @rollsclone_official",
      reward: 2,
      type: "join_channel",
      isActive: true,
      createdAt: new Date(),
    });

    // Initialize shop items with 100+ unique NFTs
    const shopItemsData = [
      // Basic Tier (3-10 TON)
      { name: "Wooden Chest", icon: "📦", price: "3.0", type: "container", rarity: "common", background: "gold", tag: "" },
      { name: "Bronze Shield", icon: "🛡️", price: "3.5", type: "armor", rarity: "common", background: "orange", tag: "" },
      { name: "Iron Sword", icon: "⚔️", price: "4.0", type: "weapon", rarity: "common", background: "red", tag: "" },
      { name: "Magic Scroll", icon: "📜", price: "4.5", type: "artifact", rarity: "common", background: "blue", tag: "" },
      { name: "Crystal Ball", icon: "🔮", price: "5.0", type: "mystical", rarity: "common", background: "purple", tag: "" },
      { name: "Golden Coin", icon: "🪙", price: "5.5", type: "currency", rarity: "common", background: "gold", tag: "" },
      { name: "Silver Ring", icon: "💍", price: "6.0", type: "jewelry", rarity: "common", background: "blue", tag: "" },
      { name: "Ruby Gem", icon: "💎", price: "6.5", type: "gem", rarity: "common", background: "red", tag: "" },
      { name: "Emerald Stone", icon: "💚", price: "7.0", type: "gem", rarity: "common", background: "green", tag: "" },
      { name: "Sapphire Crystal", icon: "💙", price: "7.5", type: "gem", rarity: "common", background: "blue", tag: "" },
      { name: "Ancient Key", icon: "🗝️", price: "8.0", type: "tool", rarity: "common", background: "gold", tag: "" },
      { name: "Magic Potion", icon: "🧪", price: "8.5", type: "consumable", rarity: "common", background: "green", tag: "" },
      { name: "Golden Goblet", icon: "🏆", price: "9.0", type: "trophy", rarity: "common", background: "gold", tag: "" },
      { name: "Star Fragment", icon: "⭐", price: "9.5", type: "cosmic", rarity: "common", background: "purple", tag: "" },
      { name: "Fire Orb", icon: "🔥", price: "10.0", type: "elemental", rarity: "common", background: "red", tag: "" },

      // Rare Tier (11-25 TON)
      { name: "Enchanted Bow", icon: "🏹", price: "11.0", type: "weapon", rarity: "rare", background: "green", tag: "rare" },
      { name: "Dragon Scale", icon: "🐲", price: "12.0", type: "material", rarity: "rare", background: "red", tag: "rare" },
      { name: "Phoenix Feather", icon: "🪶", price: "13.0", type: "material", rarity: "rare", background: "orange", tag: "rare" },
      { name: "Moonstone", icon: "🌙", price: "14.0", type: "gem", rarity: "rare", background: "blue", tag: "rare" },
      { name: "Thunder Hammer", icon: "🔨", price: "15.0", type: "weapon", rarity: "rare", background: "purple", tag: "rare" },
      { name: "Ice Crown", icon: "👑", price: "16.0", type: "crown", rarity: "rare", background: "blue", tag: "rare" },
      { name: "Shadow Cloak", icon: "🦇", price: "17.0", type: "armor", rarity: "rare", background: "purple", tag: "rare" },
      { name: "Golden Armor", icon: "🛡️", price: "18.0", type: "armor", rarity: "rare", background: "gold", tag: "rare" },
      { name: "Mystic Staff", icon: "🪄", price: "19.0", type: "weapon", rarity: "rare", background: "purple", tag: "rare" },
      { name: "Dragon Egg", icon: "🥚", price: "20.0", type: "pet", rarity: "rare", background: "red", tag: "rare" },
      { name: "Celestial Map", icon: "🗺️", price: "21.0", type: "artifact", rarity: "rare", background: "blue", tag: "rare" },
      { name: "Flame Sword", icon: "🔥", price: "22.0", type: "weapon", rarity: "rare", background: "red", tag: "rare" },
      { name: "Forest Spirit", icon: "🧚", price: "23.0", type: "companion", rarity: "rare", background: "green", tag: "rare" },
      { name: "Ocean Pearl", icon: "🔱", price: "24.0", type: "gem", rarity: "rare", background: "blue", tag: "rare" },
      { name: "Wind Boots", icon: "👢", price: "25.0", type: "armor", rarity: "rare", background: "green", tag: "rare" },

      // Epic Tier (26-50 TON)
      { name: "Excalibur", icon: "⚔️", price: "26.0", type: "weapon", rarity: "epic", background: "gold", tag: "epic" },
      { name: "Time Crystal", icon: "⏰", price: "28.0", type: "artifact", rarity: "epic", background: "blue", tag: "epic" },
      { name: "Demon Horn", icon: "👹", price: "30.0", type: "material", rarity: "epic", background: "red", tag: "epic" },
      { name: "Angel Wing", icon: "👼", price: "32.0", type: "material", rarity: "epic", background: "gold", tag: "epic" },
      { name: "Void Stone", icon: "🕳️", price: "34.0", type: "gem", rarity: "epic", background: "purple", tag: "epic" },
      { name: "Soul Gem", icon: "👻", price: "36.0", type: "gem", rarity: "epic", background: "purple", tag: "epic" },
      { name: "Royal Scepter", icon: "👑", price: "38.0", type: "weapon", rarity: "epic", background: "gold", tag: "epic" },
      { name: "Dragon Heart", icon: "❤️", price: "40.0", type: "organ", rarity: "epic", background: "red", tag: "epic" },
      { name: "Unicorn Horn", icon: "🦄", price: "42.0", type: "material", rarity: "epic", background: "purple", tag: "epic" },
      { name: "Titan Gauntlet", icon: "✊", price: "44.0", type: "armor", rarity: "epic", background: "gold", tag: "epic" },
      { name: "Storm Ring", icon: "💍", price: "46.0", type: "jewelry", rarity: "epic", background: "blue", tag: "epic" },
      { name: "Chaos Orb", icon: "🔮", price: "48.0", type: "mystical", rarity: "epic", background: "red", tag: "epic" },
      { name: "Divine Shield", icon: "🛡️", price: "50.0", type: "armor", rarity: "epic", background: "gold", tag: "epic" },

      // Legendary Tier (51-100 TON)
      { name: "World Tree Seed", icon: "🌳", price: "55.0", type: "nature", rarity: "legendary", background: "green", tag: "legendary" },
      { name: "Cosmic Void", icon: "🌌", price: "60.0", type: "cosmic", rarity: "legendary", background: "purple", tag: "legendary" },
      { name: "God's Eye", icon: "👁️", price: "65.0", type: "artifact", rarity: "legendary", background: "gold", tag: "legendary" },
      { name: "Reality Stone", icon: "💎", price: "70.0", type: "infinity", rarity: "legendary", background: "red", tag: "legendary" },
      { name: "Time Lord Watch", icon: "⌚", price: "75.0", type: "temporal", rarity: "legendary", background: "blue", tag: "legendary" },
      { name: "Death's Scythe", icon: "☠️", price: "80.0", type: "weapon", rarity: "legendary", background: "purple", tag: "legendary" },
      { name: "Life Force", icon: "💚", price: "85.0", type: "essence", rarity: "legendary", background: "green", tag: "legendary" },
      { name: "Creator's Hand", icon: "✋", price: "90.0", type: "divine", rarity: "legendary", background: "gold", tag: "legendary" },
      { name: "Universe Key", icon: "🗝️", price: "95.0", type: "cosmic", rarity: "legendary", background: "purple", tag: "legendary" },
      { name: "Omnipotence", icon: "🌟", price: "100.0", type: "ultimate", rarity: "legendary", background: "gold", tag: "legendary" },

      // Character Collection (Animals & Creatures)
      { name: "Baby Dragon", icon: "🐉", price: "15.0", type: "creature", rarity: "rare", background: "red", tag: "creature" },
      { name: "Wise Owl", icon: "🦉", price: "12.0", type: "animal", rarity: "rare", background: "blue", tag: "creature" },
      { name: "Golden Eagle", icon: "🦅", price: "18.0", type: "animal", rarity: "rare", background: "gold", tag: "creature" },
      { name: "Magic Cat", icon: "🐱", price: "8.0", type: "pet", rarity: "common", background: "purple", tag: "creature" },
      { name: "Wolf Spirit", icon: "🐺", price: "20.0", type: "spirit", rarity: "rare", background: "blue", tag: "creature" },
      { name: "Lion King", icon: "🦁", price: "25.0", type: "royal", rarity: "epic", background: "gold", tag: "creature" },
      { name: "Bear Guardian", icon: "🐻", price: "22.0", type: "guardian", rarity: "rare", background: "orange", tag: "creature" },
      { name: "Tiger Warrior", icon: "🐅", price: "28.0", type: "warrior", rarity: "epic", background: "orange", tag: "creature" },
      { name: "Elephant Sage", icon: "🐘", price: "30.0", type: "sage", rarity: "epic", background: "blue", tag: "creature" },
      { name: "Shark Hunter", icon: "🦈", price: "24.0", type: "hunter", rarity: "rare", background: "blue", tag: "creature" },

      // Cosmic Collection
      { name: "Solar Flare", icon: "☀️", price: "35.0", type: "cosmic", rarity: "epic", background: "gold", tag: "cosmic" },
      { name: "Lunar Eclipse", icon: "🌕", price: "32.0", type: "cosmic", rarity: "epic", background: "purple", tag: "cosmic" },
      { name: "Shooting Star", icon: "🌠", price: "29.0", type: "cosmic", rarity: "rare", background: "blue", tag: "cosmic" },
      { name: "Black Hole", icon: "🕳️", price: "85.0", type: "cosmic", rarity: "legendary", background: "purple", tag: "cosmic" },
      { name: "Galaxy Spiral", icon: "🌌", price: "78.0", type: "cosmic", rarity: "legendary", background: "purple", tag: "cosmic" },
      { name: "Comet Tail", icon: "☄️", price: "26.0", type: "cosmic", rarity: "rare", background: "blue", tag: "cosmic" },
      { name: "Nebula Cloud", icon: "☁️", price: "38.0", type: "cosmic", rarity: "epic", background: "purple", tag: "cosmic" },

      // Tech Collection
      { name: "Cyber Sword", icon: "⚔️", price: "45.0", type: "tech", rarity: "epic", background: "blue", tag: "tech" },
      { name: "Nano Shield", icon: "🛡️", price: "42.0", type: "tech", rarity: "epic", background: "green", tag: "tech" },
      { name: "Quantum Core", icon: "⚛️", price: "65.0", type: "tech", rarity: "legendary", background: "blue", tag: "tech" },
      { name: "AI Brain", icon: "🧠", price: "58.0", type: "tech", rarity: "legendary", background: "purple", tag: "tech" },
      { name: "Hologram", icon: "👻", price: "35.0", type: "tech", rarity: "epic", background: "blue", tag: "tech" },
      { name: "Energy Cell", icon: "🔋", price: "28.0", type: "tech", rarity: "rare", background: "green", tag: "tech" },
      { name: "Laser Gun", icon: "🔫", price: "40.0", type: "tech", rarity: "epic", background: "red", tag: "tech" },

      // Nature Collection
      { name: "Ancient Oak", icon: "🌳", price: "25.0", type: "nature", rarity: "rare", background: "green", tag: "nature" },
      { name: "Mystic Flower", icon: "🌸", price: "18.0", type: "nature", rarity: "rare", background: "purple", tag: "nature" },
      { name: "Golden Leaf", icon: "🍂", price: "15.0", type: "nature", rarity: "rare", background: "gold", tag: "nature" },
      { name: "Crystal Rose", icon: "🌹", price: "22.0", type: "nature", rarity: "rare", background: "red", tag: "nature" },
      { name: "Wind Seed", icon: "🌱", price: "12.0", type: "nature", rarity: "common", background: "green", tag: "nature" },
      { name: "Storm Cloud", icon: "⛈️", price: "30.0", type: "nature", rarity: "epic", background: "blue", tag: "nature" },
      { name: "Rainbow Bridge", icon: "🌈", price: "48.0", type: "nature", rarity: "epic", background: "purple", tag: "nature" },

      // Music Collection
      { name: "Golden Harp", icon: "🎵", price: "20.0", type: "music", rarity: "rare", background: "gold", tag: "music" },
      { name: "Magic Flute", icon: "🎶", price: "16.0", type: "music", rarity: "rare", background: "blue", tag: "music" },
      { name: "War Drums", icon: "🥁", price: "24.0", type: "music", rarity: "rare", background: "red", tag: "music" },
      { name: "Celestial Bell", icon: "🔔", price: "32.0", type: "music", rarity: "epic", background: "gold", tag: "music" },
      { name: "Siren Song", icon: "🎤", price: "28.0", type: "music", rarity: "epic", background: "blue", tag: "music" },

      // Food Collection (Fun Theme)
      { name: "Golden Apple", icon: "🍎", price: "8.0", type: "food", rarity: "common", background: "gold", tag: "food" },
      { name: "Magic Cake", icon: "🎂", price: "12.0", type: "food", rarity: "rare", background: "purple", tag: "food" },
      { name: "Dragon Fruit", icon: "🍇", price: "15.0", type: "food", rarity: "rare", background: "red", tag: "food" },
      { name: "Elixir Bottle", icon: "🍯", price: "18.0", type: "food", rarity: "rare", background: "gold", tag: "food" },
      { name: "Phoenix Egg", icon: "🥚", price: "35.0", type: "food", rarity: "epic", background: "orange", tag: "food" },

      // Transport Collection
      { name: "Flying Carpet", icon: "🪄", price: "40.0", type: "transport", rarity: "epic", background: "purple", tag: "transport" },
      { name: "Dragon Mount", icon: "🐲", price: "65.0", type: "transport", rarity: "legendary", background: "red", tag: "transport" },
      { name: "Magic Boat", icon: "⛵", price: "25.0", type: "transport", rarity: "rare", background: "blue", tag: "transport" },
      { name: "Time Machine", icon: "🚀", price: "88.0", type: "transport", rarity: "legendary", background: "blue", tag: "transport" },
      { name: "Pegasus", icon: "🦄", price: "55.0", type: "transport", rarity: "legendary", background: "gold", tag: "transport" },

      // Building Collection
      { name: "Magic Tower", icon: "🏰", price: "45.0", type: "building", rarity: "epic", background: "purple", tag: "building" },
      { name: "Dragon Lair", icon: "🏔️", price: "52.0", type: "building", rarity: "legendary", background: "red", tag: "building" },
      { name: "Crystal Palace", icon: "🏛️", price: "75.0", type: "building", rarity: "legendary", background: "blue", tag: "building" },
      { name: "Cloud City", icon: "🏙️", price: "68.0", type: "building", rarity: "legendary", background: "gold", tag: "building" },
    ];

    shopItemsData.forEach((item, index) => {
      this.shopItems.set(index + 1, {
        id: index + 1,
        name: item.name,
        description: `A ${item.rarity} ${item.type}${item.tag ? ` - ${item.tag}` : ''}`,
        price: item.price,
        icon: item.icon,
        type: item.type,
        skin: item.tag || "default",
        background: item.background,
        rarity: item.rarity,
        isAvailable: true,
        createdAt: new Date(),
      });
    });

    this.currentId = shopItemsData.length + 10;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.telegramId === telegramId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: number, balance: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.balance = balance;
      this.users.set(id, user);
    }
  }

  async getUserStats(id: number): Promise<UserWithStats | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const userStaking = Array.from(this.staking.values()).filter(s => s.userId === id);
    const totalStaked = userStaking.reduce((sum, stake) => {
      const gift = this.gifts.get(stake.giftId);
      return sum + (gift ? parseFloat(gift.value) : 0);
    }, 0);

    const referralCount = Array.from(this.referrals.values()).filter(r => r.referrerId === id).length;
    const referralEarnings = Array.from(this.referrals.values())
      .filter(r => r.referrerId === id)
      .reduce((sum, r) => sum + parseFloat(r.totalEarned), 0);

    // Calculate rank based on total staked value
    const allUsers = Array.from(this.users.values());
    const userStakeValues = allUsers.map(u => {
      const stakes = Array.from(this.staking.values()).filter(s => s.userId === u.id);
      const total = stakes.reduce((sum, stake) => {
        const gift = this.gifts.get(stake.giftId);
        return sum + (gift ? parseFloat(gift.value) : 0);
      }, 0);
      return { userId: u.id, totalStaked: total };
    });

    userStakeValues.sort((a, b) => b.totalStaked - a.totalStaked);
    const rank = userStakeValues.findIndex(u => u.userId === id) + 1;

    return {
      ...user,
      totalStaked: totalStaked.toFixed(2),
      dailyRewards: (totalStaked * 0.33 / 365).toFixed(2),
      referralCount,
      referralEarnings: referralEarnings.toFixed(2),
      rank,
    };
  }

  async getLeaderboard(): Promise<UserWithStats[]> {
    const users = Array.from(this.users.values());
    const usersWithStats = await Promise.all(
      users.map(async (user) => await this.getUserStats(user.id))
    );

    return usersWithStats
      .filter((user): user is UserWithStats => user !== undefined)
      .sort((a, b) => parseFloat(b.totalStaked) - parseFloat(a.totalStaked))
      .slice(0, 10);
  }

  // Gifts
  async getGift(id: number): Promise<Gift | undefined> {
    return this.gifts.get(id);
  }

  async getUserGifts(userId: number): Promise<Gift[]> {
    return Array.from(this.gifts.values()).filter(gift => gift.ownerId === userId);
  }

  async createGift(insertGift: InsertGift): Promise<Gift> {
    const id = this.currentId++;
    const gift: Gift = { ...insertGift, id, createdAt: new Date() };
    this.gifts.set(id, gift);
    return gift;
  }

  async updateGiftOwner(id: number, ownerId: number | null): Promise<void> {
    const gift = this.gifts.get(id);
    if (gift) {
      gift.ownerId = ownerId;
      this.gifts.set(id, gift);
    }
  }

  async setGiftInGame(id: number, inGame: boolean): Promise<void> {
    const gift = this.gifts.get(id);
    if (gift) {
      gift.isInGame = inGame;
      this.gifts.set(id, gift);
    }
  }

  // PvP Games
  async getCurrentPvpGame(): Promise<PvpGameWithParticipants | undefined> {
    const game = Array.from(this.pvpGames.values()).find(g => g.status === "waiting");
    if (!game) return undefined;

    const participants = Array.from(this.pvpParticipants.values())
      .filter(p => p.gameId === game.id)
      .map(p => ({
        ...p,
        user: this.users.get(p.userId)!,
        gift: this.gifts.get(p.giftId)!,
      }));

    return { ...game, participants };
  }

  async createPvpGame(insertGame: InsertPvpGame): Promise<PvpGame> {
    const id = this.currentId++;
    const game: PvpGame = { ...insertGame, id, createdAt: new Date(), completedAt: null };
    this.pvpGames.set(id, game);
    return game;
  }

  async addPvpParticipant(insertParticipant: InsertPvpParticipant): Promise<PvpParticipant> {
    const id = this.currentId++;
    const participant: PvpParticipant = { ...insertParticipant, id, createdAt: new Date() };
    this.pvpParticipants.set(id, participant);
    return participant;
  }

  async completePvpGame(gameId: number, winnerId: number): Promise<void> {
    const game = this.pvpGames.get(gameId);
    if (game) {
      game.status = "completed";
      game.winnerId = winnerId;
      game.completedAt = new Date();
      this.pvpGames.set(gameId, game);
    }
  }

  async getPvpGameHistory(limit: number): Promise<PvpGameWithParticipants[]> {
    const games = Array.from(this.pvpGames.values())
      .filter(g => g.status === "completed")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return games.map(game => ({
      ...game,
      participants: Array.from(this.pvpParticipants.values())
        .filter(p => p.gameId === game.id)
        .map(p => ({
          ...p,
          user: this.users.get(p.userId)!,
          gift: this.gifts.get(p.giftId)!,
        })),
    }));
  }

  // Rolls
  async createRollSession(insertSession: InsertRollSession): Promise<RollSession> {
    const id = this.currentId++;
    const session: RollSession = { ...insertSession, id, createdAt: new Date() };
    this.rollSessions.set(id, session);
    return session;
  }

  async getRollHistory(userId: number, limit: number): Promise<RollSession[]> {
    return Array.from(this.rollSessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getRecentRolls(limit: number): Promise<(RollSession & { user: User })[]> {
    return Array.from(this.rollSessions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(session => ({
        ...session,
        user: this.users.get(session.userId)!,
      }));
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.isActive);
  }

  async getUserCompletedTasks(userId: number): Promise<UserTaskCompletion[]> {
    return Array.from(this.userTaskCompletions.values()).filter(c => c.userId === userId);
  }

  async completeTask(insertCompletion: InsertUserTaskCompletion): Promise<UserTaskCompletion> {
    const id = this.currentId++;
    const completion: UserTaskCompletion = { ...insertCompletion, id, completedAt: new Date() };
    this.userTaskCompletions.set(id, completion);
    return completion;
  }

  // Referrals
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = this.currentId++;
    const referral: Referral = { ...insertReferral, id, createdAt: new Date() };
    this.referrals.set(id, referral);
    return referral;
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(r => r.referrerId === userId);
  }

  async updateReferralEarnings(referrerId: number, amount: string): Promise<void> {
    const referral = Array.from(this.referrals.values()).find(r => r.referrerId === referrerId);
    if (referral) {
      referral.totalEarned = (parseFloat(referral.totalEarned) + parseFloat(amount)).toFixed(2);
      this.referrals.set(referral.id, referral);
    }
  }

  // Staking
  async stakeGift(insertStaking: InsertStaking): Promise<Staking> {
    const id = this.currentId++;
    const staking: Staking = { 
      ...insertStaking, 
      id, 
      stakedAt: new Date(), 
      lastRewardClaimed: new Date() 
    };
    this.staking.set(id, staking);
    return staking;
  }

  async unstakeGift(giftId: number): Promise<void> {
    const staking = Array.from(this.staking.values()).find(s => s.giftId === giftId);
    if (staking) {
      this.staking.delete(staking.id);
    }
  }

  async getUserStaking(userId: number): Promise<(Staking & { gift: Gift })[]> {
    return Array.from(this.staking.values())
      .filter(s => s.userId === userId)
      .map(s => ({
        ...s,
        gift: this.gifts.get(s.giftId)!,
      }));
  }

  async claimStakingRewards(userId: number): Promise<void> {
    const userStaking = Array.from(this.staking.values()).filter(s => s.userId === userId);
    userStaking.forEach(s => {
      s.lastRewardClaimed = new Date();
      this.staking.set(s.id, s);
    });
  }

  // Shop
  async getShopItems(): Promise<ShopItem[]> {
    return Array.from(this.shopItems.values()).filter(i => i.isAvailable);
  }

  async getShopItem(id: number): Promise<ShopItem | undefined> {
    return this.shopItems.get(id);
  }

  async purchaseShopItem(userId: number, itemId: number): Promise<Gift> {
    const item = this.shopItems.get(itemId);
    if (!item) throw new Error("Item not found");

    const gift = await this.createGift({
      name: item.name,
      description: item.description,
      value: item.price,
      icon: item.icon,
      type: item.type,
      skin: item.skin,
      background: item.background,
      rarity: item.rarity,
      ownerId: userId,
      isInGame: false,
    });

    return gift;
  }
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(id: number, balance: string): Promise<void> {
    await db.update(users).set({ balance }).where(eq(users.id, id));
  }

  async getUserStats(id: number): Promise<UserWithStats | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return undefined;

    // Get staking stats
    const stakingResults = await db
      .select({
        totalStaked: sum(gifts.value),
        count: count()
      })
      .from(staking)
      .innerJoin(gifts, eq(staking.giftId, gifts.id))
      .where(eq(staking.userId, id));

    const totalStaked = stakingResults[0]?.totalStaked || "0";

    // Get referral stats
    const referralResults = await db
      .select({
        referralCount: count(),
        referralEarnings: sum(referrals.totalEarned)
      })
      .from(referrals)
      .where(eq(referrals.referrerId, id));

    const referralCount = referralResults[0]?.referralCount || 0;
    const referralEarnings = referralResults[0]?.referralEarnings || "0";

    // Calculate rank (simplified)
    const rank = 1;

    return {
      ...user,
      totalStaked,
      dailyRewards: "0",
      referralCount,
      referralEarnings,
      rank
    };
  }

  async getLeaderboard(): Promise<UserWithStats[]> {
    const usersData = await db.select().from(users).limit(10);
    return Promise.all(usersData.map(async (user) => {
      const stats = await this.getUserStats(user.id);
      return stats!;
    }));
  }

  // Gifts
  async getGift(id: number): Promise<Gift | undefined> {
    const [gift] = await db.select().from(gifts).where(eq(gifts.id, id));
    return gift || undefined;
  }

  async getUserGifts(userId: number): Promise<Gift[]> {
    return await db.select().from(gifts).where(eq(gifts.ownerId, userId));
  }

  async createGift(insertGift: InsertGift): Promise<Gift> {
    const [gift] = await db
      .insert(gifts)
      .values(insertGift)
      .returning();
    return gift;
  }

  async updateGiftOwner(id: number, ownerId: number | null): Promise<void> {
    await db.update(gifts).set({ ownerId }).where(eq(gifts.id, id));
  }

  async setGiftInGame(id: number, inGame: boolean): Promise<void> {
    await db.update(gifts).set({ isInGame: inGame }).where(eq(gifts.id, id));
  }

  // PvP Games
  async getCurrentPvpGame(): Promise<PvpGameWithParticipants | undefined> {
    const [game] = await db.select().from(pvpGames).where(isNull(pvpGames.completedAt));
    if (!game) return undefined;

    const participants = await db
      .select({
        participant: pvpParticipants,
        user: users,
        gift: gifts
      })
      .from(pvpParticipants)
      .innerJoin(users, eq(pvpParticipants.userId, users.id))
      .innerJoin(gifts, eq(pvpParticipants.giftId, gifts.id))
      .where(eq(pvpParticipants.gameId, game.id));

    return {
      ...game,
      participants: participants.map(p => ({
        ...p.participant,
        user: p.user,
        gift: p.gift
      }))
    };
  }

  async createPvpGame(insertGame: InsertPvpGame): Promise<PvpGame> {
    const [game] = await db
      .insert(pvpGames)
      .values(insertGame)
      .returning();
    return game;
  }

  async addPvpParticipant(insertParticipant: InsertPvpParticipant): Promise<PvpParticipant> {
    const [participant] = await db
      .insert(pvpParticipants)
      .values(insertParticipant)
      .returning();
    return participant;
  }

  async completePvpGame(gameId: number, winnerId: number): Promise<void> {
    await db.update(pvpGames).set({ 
      winnerId, 
      completedAt: new Date() 
    }).where(eq(pvpGames.id, gameId));
  }

  async getPvpGameHistory(limit: number): Promise<PvpGameWithParticipants[]> {
    const games = await db
      .select()
      .from(pvpGames)
      .where(eq(pvpGames.status, "completed"))
      .orderBy(desc(pvpGames.completedAt))
      .limit(limit);

    return Promise.all(games.map(async (game) => {
      const participants = await db
        .select({
          participant: pvpParticipants,
          user: users,
          gift: gifts
        })
        .from(pvpParticipants)
        .innerJoin(users, eq(pvpParticipants.userId, users.id))
        .innerJoin(gifts, eq(pvpParticipants.giftId, gifts.id))
        .where(eq(pvpParticipants.gameId, game.id));

      return {
        ...game,
        participants: participants.map(p => ({
          ...p.participant,
          user: p.user,
          gift: p.gift
        }))
      };
    }));
  }

  // Rolls
  async createRollSession(insertSession: InsertRollSession): Promise<RollSession> {
    const [session] = await db
      .insert(rollSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getRollHistory(userId: number, limit: number): Promise<RollSession[]> {
    return await db
      .select()
      .from(rollSessions)
      .where(eq(rollSessions.userId, userId))
      .orderBy(desc(rollSessions.createdAt))
      .limit(limit);
  }

  async getRecentRolls(limit: number): Promise<(RollSession & { user: User })[]> {
    const results = await db
      .select({
        session: rollSessions,
        user: users
      })
      .from(rollSessions)
      .innerJoin(users, eq(rollSessions.userId, users.id))
      .orderBy(desc(rollSessions.createdAt))
      .limit(limit);

    return results.map(r => ({
      ...r.session,
      user: r.user
    }));
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getUserCompletedTasks(userId: number): Promise<UserTaskCompletion[]> {
    return await db
      .select()
      .from(userTaskCompletions)
      .where(eq(userTaskCompletions.userId, userId));
  }

  async completeTask(insertCompletion: InsertUserTaskCompletion): Promise<UserTaskCompletion> {
    const [completion] = await db
      .insert(userTaskCompletions)
      .values(insertCompletion)
      .returning();
    return completion;
  }

  // Referrals
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values(insertReferral)
      .returning();
    return referral;
  }

  async getUserReferrals(userId: number): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));
  }

  async updateReferralEarnings(referrerId: number, amount: string): Promise<void> {
    await db.update(referrals).set({ 
      totalEarned: amount 
    }).where(eq(referrals.referrerId, referrerId));
  }

  // Staking
  async stakeGift(insertStaking: InsertStaking): Promise<Staking> {
    const [staking] = await db
      .insert(staking)
      .values(insertStaking)
      .returning();
    return staking;
  }

  async unstakeGift(giftId: number): Promise<void> {
    await db.delete(staking).where(eq(staking.giftId, giftId));
  }

  async getUserStaking(userId: number): Promise<(Staking & { gift: Gift })[]> {
    const results = await db
      .select({
        staking: staking,
        gift: gifts
      })
      .from(staking)
      .innerJoin(gifts, eq(staking.giftId, gifts.id))
      .where(eq(staking.userId, userId));

    return results.map(r => ({
      ...r.staking,
      gift: r.gift
    }));
  }

  async claimStakingRewards(userId: number): Promise<void> {
    // Update last claim time
    await db.update(staking).set({ 
      lastClaimAt: new Date() 
    }).where(eq(staking.userId, userId));
  }

  // Shop
  async getShopItems(): Promise<ShopItem[]> {
    return await db.select().from(shopItems).where(eq(shopItems.isAvailable, true));
  }

  async getShopItem(id: number): Promise<ShopItem | undefined> {
    const [item] = await db.select().from(shopItems).where(eq(shopItems.id, id));
    return item || undefined;
  }

  async purchaseShopItem(userId: number, itemId: number): Promise<Gift> {
    const item = await this.getShopItem(itemId);
    if (!item) throw new Error("Item not found");

    const gift = await this.createGift({
      name: item.name,
      description: item.description,
      value: item.price,
      icon: item.icon,
      type: item.type,
      skin: item.skin,
      background: item.background,
      rarity: item.rarity,
      ownerId: userId,
      isInGame: false,
    });

    return gift;
  }
}

export const storage = new DatabaseStorage();
