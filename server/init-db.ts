import { db } from "./db";
import { users, shopItems, tasks } from "@shared/schema";
import { eq } from "drizzle-orm";

async function initializeDatabase() {
  try {
    // Check if we already have data
    const existingItems = await db.select().from(shopItems).limit(1);
    if (existingItems.length > 0) {
      console.log("Database already initialized");
      return;
    }

    console.log("Initializing database with seed data...");

    // Create sample user
    const [sampleUser] = await db.insert(users).values({
      telegramId: "123456789",
      username: "SampleUser",
      firstName: "Sample",
      lastName: "User",
      balance: "100.0",
      walletAddress: null,
      avatarUrl: null,
      languageCode: "en",
      isPremium: false,
      allowsWriteToPm: true,
      queryId: null,
      chatInstance: null,
      chatType: null,
      startParam: null,
      canSendAfter: null,
      authDate: Math.floor(Date.now() / 1000),
      hash: "sample-hash"
    }).returning();

    // Initialize shop items
    const shopItemsData = [
      // Cosmic Collection
      { name: "Nebula Crystal", icon: "🌌", price: "15.0", type: "cosmic", rarity: "rare", background: "blue", tag: "cosmic" },
      { name: "Stardust Orb", icon: "✨", price: "8.0", type: "cosmic", rarity: "common", background: "purple", tag: "cosmic" },
      { name: "Galaxy Stone", icon: "🌠", price: "25.0", type: "cosmic", rarity: "epic", background: "gold", tag: "cosmic" },
      { name: "Meteorite Fragment", icon: "☄️", price: "12.0", type: "cosmic", rarity: "rare", background: "orange", tag: "cosmic" },
      { name: "Cosmic Gem", icon: "💎", price: "45.0", type: "cosmic", rarity: "legendary", background: "rainbow", tag: "cosmic" },
      { name: "Solar Flare", icon: "🔥", price: "35.0", type: "cosmic", rarity: "epic", background: "red", tag: "cosmic" },
      { name: "Moon Dust", icon: "🌙", price: "6.0", type: "cosmic", rarity: "common", background: "silver", tag: "cosmic" },
      { name: "Pulsar Wave", icon: "🌊", price: "55.0", type: "cosmic", rarity: "legendary", background: "blue", tag: "cosmic" },
      { name: "Quasar Light", icon: "💫", price: "75.0", type: "cosmic", rarity: "legendary", background: "gold", tag: "cosmic" },
      { name: "Black Hole", icon: "⚫", price: "100.0", type: "cosmic", rarity: "legendary", background: "black", tag: "cosmic" },

      // Tech Collection
      { name: "Quantum Processor", icon: "🔬", price: "22.0", type: "tech", rarity: "rare", background: "blue", tag: "tech" },
      { name: "Neural Interface", icon: "🧠", price: "18.0", type: "tech", rarity: "rare", background: "purple", tag: "tech" },
      { name: "Holographic Display", icon: "📱", price: "14.0", type: "tech", rarity: "common", background: "cyan", tag: "tech" },
      { name: "Fusion Core", icon: "⚡", price: "35.0", type: "tech", rarity: "epic", background: "yellow", tag: "tech" },
      { name: "Nanobot Swarm", icon: "🤖", price: "28.0", type: "tech", rarity: "epic", background: "green", tag: "tech" },
      { name: "Plasma Cannon", icon: "🔫", price: "42.0", type: "tech", rarity: "legendary", background: "red", tag: "tech" },
      { name: "Time Machine", icon: "⏰", price: "85.0", type: "tech", rarity: "legendary", background: "gold", tag: "tech" },
      { name: "AI Core", icon: "🧮", price: "65.0", type: "tech", rarity: "legendary", background: "blue", tag: "tech" },
      { name: "Teleporter", icon: "🌀", price: "70.0", type: "tech", rarity: "legendary", background: "purple", tag: "tech" },
      { name: "Energy Shield", icon: "🛡️", price: "32.0", type: "tech", rarity: "epic", background: "cyan", tag: "tech" },

      // Nature Collection
      { name: "Ancient Oak", icon: "🌳", price: "16.0", type: "nature", rarity: "rare", background: "green", tag: "nature" },
      { name: "Mystic Flower", icon: "🌸", price: "9.0", type: "nature", rarity: "common", background: "pink", tag: "nature" },
      { name: "Crystal Spring", icon: "💧", price: "20.0", type: "nature", rarity: "rare", background: "blue", tag: "nature" },
      { name: "Golden Leaf", icon: "🍃", price: "24.0", type: "nature", rarity: "epic", background: "gold", tag: "nature" },
      { name: "Thunder Cloud", icon: "⛈️", price: "30.0", type: "nature", rarity: "epic", background: "gray", tag: "nature" },
      { name: "Phoenix Feather", icon: "🔥", price: "48.0", type: "nature", rarity: "legendary", background: "red", tag: "nature" },
      { name: "Dragon Scale", icon: "🐉", price: "55.0", type: "nature", rarity: "legendary", background: "green", tag: "nature" },
      { name: "Enchanted Mushroom", icon: "🍄", price: "12.0", type: "nature", rarity: "common", background: "red", tag: "nature" },
      { name: "Healing Potion", icon: "🧪", price: "18.0", type: "nature", rarity: "rare", background: "green", tag: "nature" },
      { name: "World Tree Seed", icon: "🌰", price: "90.0", type: "nature", rarity: "legendary", background: "gold", tag: "nature" },

      // Music Collection
      { name: "Magic Harp", icon: "🎵", price: "26.0", type: "music", rarity: "epic", background: "gold", tag: "music" },
      { name: "Crystal Bell", icon: "🔔", price: "14.0", type: "music", rarity: "rare", background: "silver", tag: "music" },
      { name: "Thunder Drum", icon: "🥁", price: "32.0", type: "music", rarity: "epic", background: "brown", tag: "music" },
      { name: "Violin of Souls", icon: "🎻", price: "45.0", type: "music", rarity: "legendary", background: "red", tag: "music" },
      { name: "Flute of Wind", icon: "🎶", price: "22.0", type: "music", rarity: "rare", background: "blue", tag: "music" },
      { name: "Piano of Dreams", icon: "🎹", price: "60.0", type: "music", rarity: "legendary", background: "black", tag: "music" },
      { name: "Saxophone Jazz", icon: "🎷", price: "35.0", type: "music", rarity: "epic", background: "gold", tag: "music" },
      { name: "Guitar Hero", icon: "🎸", price: "28.0", type: "music", rarity: "epic", background: "red", tag: "music" },
      { name: "Microphone Star", icon: "🎤", price: "18.0", type: "music", rarity: "rare", background: "silver", tag: "music" },
      { name: "Symphony Crown", icon: "👑", price: "80.0", type: "music", rarity: "legendary", background: "gold", tag: "music" },

      // Food Collection
      { name: "Golden Apple", icon: "🍎", price: "11.0", type: "food", rarity: "rare", background: "gold", tag: "food" },
      { name: "Magic Cake", icon: "🍰", price: "8.0", type: "food", rarity: "common", background: "pink", tag: "food" },
      { name: "Dragon Fruit", icon: "🐲", price: "25.0", type: "food", rarity: "epic", background: "red", tag: "food" },
      { name: "Honey Potion", icon: "🍯", price: "15.0", type: "food", rarity: "rare", background: "yellow", tag: "food" },
      { name: "Elixir of Life", icon: "🧪", price: "65.0", type: "food", rarity: "legendary", background: "blue", tag: "food" },
      { name: "Phoenix Egg", icon: "🥚", price: "50.0", type: "food", rarity: "legendary", background: "red", tag: "food" },
      { name: "Unicorn Milk", icon: "🥛", price: "40.0", type: "food", rarity: "legendary", background: "white", tag: "food" },
      { name: "Mystic Tea", icon: "🍵", price: "18.0", type: "food", rarity: "rare", background: "green", tag: "food" },
      { name: "Crystal Sugar", icon: "🍬", price: "12.0", type: "food", rarity: "common", background: "pink", tag: "food" },
      { name: "Nectar of Gods", icon: "🍯", price: "75.0", type: "food", rarity: "legendary", background: "gold", tag: "food" },

      // Transport Collection
      { name: "Flying Carpet", icon: "🪶", price: "38.0", type: "transport", rarity: "epic", background: "purple", tag: "transport" },
      { name: "Magic Boots", icon: "👢", price: "20.0", type: "transport", rarity: "rare", background: "brown", tag: "transport" },
      { name: "Teleport Stone", icon: "🗿", price: "42.0", type: "transport", rarity: "legendary", background: "gray", tag: "transport" },
      { name: "Wind Cloak", icon: "🌪️", price: "30.0", type: "transport", rarity: "epic", background: "cyan", tag: "transport" },
      { name: "Portal Key", icon: "🗝️", price: "48.0", type: "transport", rarity: "legendary", background: "gold", tag: "transport" },
      { name: "Dragon Mount", icon: "🐉", price: "85.0", type: "transport", rarity: "legendary", background: "red", tag: "transport" },
      { name: "Griffin Feather", icon: "🦅", price: "35.0", type: "transport", rarity: "epic", background: "brown", tag: "transport" },
      { name: "Pegasus", icon: "🦄", price: "55.0", type: "transport", rarity: "legendary", background: "gold", tag: "transport" },

      // Building Collection
      { name: "Magic Tower", icon: "🏰", price: "45.0", type: "building", rarity: "epic", background: "purple", tag: "building" },
      { name: "Dragon Lair", icon: "🏔️", price: "52.0", type: "building", rarity: "legendary", background: "red", tag: "building" },
      { name: "Crystal Palace", icon: "🏛️", price: "75.0", type: "building", rarity: "legendary", background: "blue", tag: "building" },
      { name: "Cloud City", icon: "🏙️", price: "68.0", type: "building", rarity: "legendary", background: "gold", tag: "building" },
    ];

    // Insert shop items
    for (const item of shopItemsData) {
      await db.insert(shopItems).values({
        name: item.name,
        description: `A ${item.rarity} ${item.type}${item.tag ? ` - ${item.tag}` : ''}`,
        price: item.price,
        icon: item.icon,
        type: item.type,
        skin: item.tag || "default",
        background: item.background,
        rarity: item.rarity,
        isAvailable: true,
      });
    }

    // Initialize tasks
    const tasksData = [
      { 
        title: "First Roll", 
        description: "Complete your first roll", 
        reward: "5.0", 
        type: "roll",
        requirement: "1" 
      },
      { 
        title: "Join PvP", 
        description: "Participate in a PvP game", 
        reward: "10.0", 
        type: "pvp",
        requirement: "1" 
      },
      { 
        title: "Invite Friends", 
        description: "Invite 3 friends to the game", 
        reward: "25.0", 
        type: "referral",
        requirement: "3" 
      },
      { 
        title: "Shop Purchase", 
        description: "Buy an item from the shop", 
        reward: "15.0", 
        type: "shop",
        requirement: "1" 
      },
      { 
        title: "Stake Gifts", 
        description: "Stake 5 gifts for rewards", 
        reward: "20.0", 
        type: "staking",
        requirement: "5" 
      }
    ];

    for (const task of tasksData) {
      await db.insert(tasks).values(task);
    }

    console.log("Database initialized successfully with seed data!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export { initializeDatabase };