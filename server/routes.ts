import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, insertGiftSchema, insertPvpGameSchema, insertPvpParticipantSchema,
  insertRollSessionSchema, insertUserTaskCompletionSchema, insertReferralSchema,
  insertStakingSchema, type User, type PvpGameWithParticipants, type Gift
} from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

interface WebSocketConnection {
  ws: WebSocket;
  userId?: number;
}

const connections: WebSocketConnection[] = [];

function broadcast(message: any) {
  const messageStr = JSON.stringify(message);
  connections.forEach(conn => {
    if (conn.ws.readyState === WebSocket.OPEN) {
      conn.ws.send(messageStr);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    const connection: WebSocketConnection = { ws };
    connections.push(connection);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth' && data.userId) {
          connection.userId = data.userId;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      const index = connections.indexOf(connection);
      if (index > -1) {
        connections.splice(index, 1);
      }
    });
  });

  // Auth endpoints
  app.post('/api/auth/telegram', async (req, res) => {
    try {
      const { telegramId, username } = req.body;
      
      let user = await storage.getUserByTelegramId(telegramId);
      if (!user) {
        user = await storage.createUser({
          username,
          telegramId,
          balance: "10.00", // Starting balance
          walletAddress: null,
        });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // User endpoints
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.get('/api/users/:id/stats', async (req, res) => {
    try {
      const stats = await storage.getUserStats(parseInt(req.params.id));
      if (!stats) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  });

  app.get('/api/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // PvP endpoints
  app.get('/api/pvp/current', async (req, res) => {
    try {
      let game = await storage.getCurrentPvpGame();
      if (!game) {
        // Create new game
        const gameHash = crypto.randomBytes(32).toString('hex');
        const countdown = new Date(Date.now() + 30000); // 30 seconds
        
        game = await storage.createPvpGame({
          status: "waiting",
          totalValue: "0",
          winnerId: null,
          gameHash,
          countdownEnds: countdown,
        }) as PvpGameWithParticipants;
        game.participants = [];
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch current game' });
    }
  });

  app.post('/api/pvp/join', async (req, res) => {
    try {
      const { gameId, userId, giftId } = req.body;
      
      const gift = await storage.getGift(giftId);
      if (!gift || gift.ownerId !== userId) {
        return res.status(400).json({ error: 'Invalid gift' });
      }

      // Calculate win chance (simplified)
      const game = await storage.getCurrentPvpGame();
      if (!game) {
        return res.status(400).json({ error: 'No active game' });
      }

      const totalValue = parseFloat(game.totalValue) + parseFloat(gift.value);
      const winChance = (parseFloat(gift.value) / totalValue) * 100;

      const participant = await storage.addPvpParticipant({
        gameId,
        userId,
        giftId,
        winChance: winChance.toFixed(2),
      });

      // Update gift and game
      await storage.setGiftInGame(giftId, true);
      await storage.updateUserBalance(userId, (parseFloat((await storage.getUser(userId))!.balance) - parseFloat(gift.value)).toFixed(2));

      // Broadcast update
      broadcast({
        type: 'pvp_participant_joined',
        participant,
        game: await storage.getCurrentPvpGame(),
      });

      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: 'Failed to join game' });
    }
  });

  app.get('/api/pvp/history', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getPvpGameHistory(limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch game history' });
    }
  });

  // Gifts endpoints
  app.get('/api/gifts/user/:userId', async (req, res) => {
    try {
      const gifts = await storage.getUserGifts(parseInt(req.params.userId));
      res.json(gifts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user gifts' });
    }
  });

  // Rolls endpoints
  app.post('/api/rolls', async (req, res) => {
    try {
      const { userId, quantity } = req.body;
      const costPerRoll = 0.5;
      const totalCost = quantity * costPerRoll;
      
      const user = await storage.getUser(userId);
      if (!user || parseFloat(user.balance) < totalCost) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Generate roll results with weighted probabilities
      const results = [];
      const prizes = [
        // Common prizes (70% total chance)
        { name: "Basic Gift Box", icon: "🎁", value: "0.8", rarity: "common", weight: 15 },
        { name: "Copper Coin", icon: "🪙", value: "0.6", rarity: "common", weight: 15 },
        { name: "Silver Star", icon: "⭐", value: "1.2", rarity: "common", weight: 12 },
        { name: "Bronze Medal", icon: "🏅", value: "1.0", rarity: "common", weight: 12 },
        { name: "Magic Potion", icon: "🧪", value: "1.5", rarity: "common", weight: 10 },
        { name: "Crystal Shard", icon: "💎", value: "1.8", rarity: "common", weight: 8 },
        { name: "Mystic Mask", icon: "🎭", value: "2.2", rarity: "common", weight: 8 },
        
        // Rare prizes (25% total chance)
        { name: "Golden Trophy", icon: "🏆", value: "4.5", rarity: "rare", weight: 6 },
        { name: "Fire Crystal", icon: "🔥", value: "5.2", rarity: "rare", weight: 5 },
        { name: "Lightning Bolt", icon: "⚡", value: "6.0", rarity: "rare", weight: 4 },
        { name: "Royal Crown", icon: "👑", value: "7.5", rarity: "rare", weight: 3 },
        { name: "Ancient Sword", icon: "🗡️", value: "8.2", rarity: "rare", weight: 3 },
        { name: "Magic Shield", icon: "🛡️", value: "9.0", rarity: "rare", weight: 2 },
        { name: "Diamond Ring", icon: "💍", value: "12.0", rarity: "rare", weight: 2 },
        
        // Epic prizes (5% total chance)
        { name: "Circus Tent", icon: "🎪", value: "25.0", rarity: "epic", weight: 3 },
        { name: "Crystal Orb", icon: "🔮", value: "50.0", rarity: "epic", weight: 2 },
      ];

      for (let i = 0; i < quantity; i++) {
        // Weighted random selection
        const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
        const random = Math.random() * totalWeight;
        let currentWeight = 0;
        let selectedPrize = prizes[0];

        for (const prize of prizes) {
          currentWeight += prize.weight;
          if (random <= currentWeight) {
            selectedPrize = prize;
            break;
          }
        }

        results.push({
          name: selectedPrize.name,
          icon: selectedPrize.icon,
          value: selectedPrize.value,
          rarity: selectedPrize.rarity
        });
        
        // Create gift for user
        await storage.createGift({
          name: selectedPrize.name,
          description: `A ${selectedPrize.rarity} prize from rolling`,
          value: selectedPrize.value,
          icon: selectedPrize.icon,
          type: "prize",
          skin: "default",
          background: "default",
          rarity: selectedPrize.rarity,
          ownerId: userId,
          isInGame: false,
        });
      }

      // Update user balance
      await storage.updateUserBalance(userId, (parseFloat(user.balance) - totalCost).toFixed(2));

      const session = await storage.createRollSession({
        userId,
        quantity,
        cost: totalCost.toFixed(2),
        results,
      });

      // Log for audit purposes
      console.log(`[ROLL AUDIT] User ${user.id} (${user.username}) rolled ${quantity} times for ${totalCost} TON. Results:`, results.map(r => `${r.name} (${r.rarity}, ${r.value} TON)`));

      // Broadcast roll results
      broadcast({
        type: 'roll_completed',
        session,
        user,
        results,
      });

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to process roll' });
    }
  });

  app.get('/api/rolls/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recent = await storage.getRecentRolls(limit);
      res.json(recent);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recent rolls' });
    }
  });

  // Shop endpoints
  app.get('/api/shop/items', async (req, res) => {
    try {
      const items = await storage.getShopItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch shop items' });
    }
  });

  app.post('/api/shop/purchase', async (req, res) => {
    try {
      const { userId, itemId } = req.body;
      
      const user = await storage.getUser(userId);
      const item = await storage.getShopItem(itemId);
      
      if (!user || !item) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      if (parseFloat(user.balance) < parseFloat(item.price)) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      const gift = await storage.purchaseShopItem(userId, itemId);
      await storage.updateUserBalance(userId, (parseFloat(user.balance) - parseFloat(item.price)).toFixed(2));

      res.json(gift);
    } catch (error) {
      res.status(500).json({ error: 'Failed to purchase item' });
    }
  });

  // Tasks endpoints
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  app.get('/api/tasks/completed/:userId', async (req, res) => {
    try {
      const completed = await storage.getUserCompletedTasks(parseInt(req.params.userId));
      res.json(completed);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch completed tasks' });
    }
  });

  app.post('/api/tasks/complete', async (req, res) => {
    try {
      const { userId, taskId } = req.body;
      
      const completion = await storage.completeTask({
        userId,
        taskId,
      });

      res.json(completion);
    } catch (error) {
      res.status(500).json({ error: 'Failed to complete task' });
    }
  });

  // Referrals endpoints
  app.get('/api/referrals/:userId', async (req, res) => {
    try {
      const referrals = await storage.getUserReferrals(parseInt(req.params.userId));
      res.json(referrals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch referrals' });
    }
  });

  app.post('/api/referrals', async (req, res) => {
    try {
      const { referrerId, referredId } = req.body;
      
      const referral = await storage.createReferral({
        referrerId,
        referredId,
        totalEarned: "0",
      });

      res.json(referral);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create referral' });
    }
  });

  // Staking endpoints
  app.get('/api/staking/:userId', async (req, res) => {
    try {
      const staking = await storage.getUserStaking(parseInt(req.params.userId));
      res.json(staking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch staking info' });
    }
  });

  app.post('/api/staking/stake', async (req, res) => {
    try {
      const { userId, giftId } = req.body;
      
      const staking = await storage.stakeGift({
        userId,
        giftId,
      });

      res.json(staking);
    } catch (error) {
      res.status(500).json({ error: 'Failed to stake gift' });
    }
  });

  app.post('/api/staking/unstake', async (req, res) => {
    try {
      const { giftId } = req.body;
      
      await storage.unstakeGift(giftId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unstake gift' });
    }
  });

  // Game logic - spin roulette
  setInterval(async () => {
    try {
      const game = await storage.getCurrentPvpGame();
      if (!game || !game.countdownEnds) return;

      if (new Date() >= game.countdownEnds && game.participants.length > 0) {
        // Determine winner based on weighted probability
        const totalValue = game.participants.reduce((sum, p) => sum + parseFloat(p.gift.value), 0);
        const random = Math.random() * totalValue;
        let currentSum = 0;
        let winner = game.participants[0];

        for (const participant of game.participants) {
          currentSum += parseFloat(participant.gift.value);
          if (random <= currentSum) {
            winner = participant;
            break;
          }
        }

        // Complete game
        await storage.completePvpGame(game.id, winner.userId);
        
        // Transfer all gifts to winner
        const winnerValue = game.participants.reduce((sum, p) => sum + parseFloat(p.gift.value), 0);
        const platformFee = winnerValue * 0.05; // 5% platform fee
        const actualWinnings = winnerValue - platformFee;
        
        await storage.updateUserBalance(winner.userId, 
          (parseFloat((await storage.getUser(winner.userId))!.balance) + actualWinnings).toFixed(2)
        );

        // Reset all gifts
        for (const participant of game.participants) {
          await storage.setGiftInGame(participant.giftId, false);
        }

        // Broadcast game completion
        broadcast({
          type: 'pvp_game_completed',
          winner,
          winnings: actualWinnings,
          game,
        });
      }
    } catch (error) {
      console.error('Game logic error:', error);
    }
  }, 1000); // Check every second

  return httpServer;
}
