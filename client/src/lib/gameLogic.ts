import type { PvpParticipant, User, Gift } from '@shared/schema';

export interface RouletteResult {
  winner: PvpParticipant & { user: User; gift: Gift };
  finalRotation: number;
  spinDuration: number;
}

export interface RollResult {
  prize: {
    name: string;
    icon: string;
    value: string;
    rarity: string;
  };
  rotation: number;
}

export class GameLogic {
  // PvP Roulette Logic
  static calculateWinChances(participants: (PvpParticipant & { user: User; gift: Gift })[]): (PvpParticipant & { user: User; gift: Gift; winChance: number })[] {
    const totalValue = participants.reduce((sum, p) => sum + parseFloat(p.gift.value), 0);
    
    return participants.map(participant => ({
      ...participant,
      winChance: totalValue > 0 ? (parseFloat(participant.gift.value) / totalValue) * 100 : 0,
    }));
  }

  static determineRouletteWinner(participants: (PvpParticipant & { user: User; gift: Gift })[]): RouletteResult {
    if (participants.length === 0) {
      throw new Error('No participants in the game');
    }

    const totalValue = participants.reduce((sum, p) => sum + parseFloat(p.gift.value), 0);
    const random = Math.random() * totalValue;
    let currentSum = 0;
    let winner = participants[0];

    for (const participant of participants) {
      currentSum += parseFloat(participant.gift.value);
      if (random <= currentSum) {
        winner = participant;
        break;
      }
    }

    // Calculate rotation for visual effect
    const winnerIndex = participants.indexOf(winner);
    const segmentAngle = 360 / participants.length;
    const targetAngle = winnerIndex * segmentAngle + (segmentAngle / 2);
    
    // Add multiple rotations for spinning effect
    const fullRotations = 4 + Math.random() * 2; // 4-6 full rotations
    const finalRotation = fullRotations * 360 + (360 - targetAngle);
    
    return {
      winner,
      finalRotation,
      spinDuration: 3000 + Math.random() * 2000, // 3-5 seconds
    };
  }

  static calculatePlatformFee(totalValue: number, feePercentage: number = 0.05): number {
    return totalValue * feePercentage;
  }

  static calculateNetWinnings(totalValue: number, feePercentage: number = 0.05): number {
    return totalValue - this.calculatePlatformFee(totalValue, feePercentage);
  }

  // Roll Game Logic
  static generateRollResult(): RollResult {
    const prizes = [
      { name: "Golden Box", icon: "🎁", value: "3.5", rarity: "common", weight: 30 },
      { name: "Diamond Rare", icon: "💎", value: "7.2", rarity: "rare", weight: 20 },
      { name: "Victory Trophy", icon: "🏆", value: "5.8", rarity: "epic", weight: 15 },
      { name: "Stellar Gem", icon: "⭐", value: "4.1", rarity: "rare", weight: 15 },
      { name: "Fire Crystal", icon: "🔥", value: "6.5", rarity: "epic", weight: 10 },
      { name: "Lightning Bolt", icon: "⚡", value: "8.9", rarity: "legendary", weight: 8 },
      { name: "Mystic Orb", icon: "🔮", value: "12.0", rarity: "legendary", weight: 2 },
    ];

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

    // Calculate rotation
    const prizeIndex = prizes.indexOf(selectedPrize);
    const segmentAngle = 360 / prizes.length;
    const targetAngle = prizeIndex * segmentAngle + (segmentAngle / 2);
    
    // Add multiple rotations for spinning effect
    const fullRotations = 3 + Math.random() * 2; // 3-5 full rotations
    const rotation = fullRotations * 360 + (360 - targetAngle);

    return {
      prize: {
        name: selectedPrize.name,
        icon: selectedPrize.icon,
        value: selectedPrize.value,
        rarity: selectedPrize.rarity,
      },
      rotation,
    };
  }

  // Staking Logic
  static calculateStakingRewards(stakedValue: number, aprPercentage: number = 0.33, days: number = 1): number {
    const dailyRate = aprPercentage / 365;
    return stakedValue * dailyRate * days;
  }

  static calculateStakingRank(userStakedValue: number, allStakedValues: number[]): number {
    const sortedValues = [...allStakedValues].sort((a, b) => b - a);
    return sortedValues.indexOf(userStakedValue) + 1;
  }

  // Referral Logic
  static calculateReferralEarnings(referredUserSpending: number, referralPercentage: number = 0.1): number {
    return referredUserSpending * referralPercentage;
  }

  // Utility functions
  static formatTonAmount(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numAmount.toFixed(2);
  }

  static generateGameHash(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  static validateGameIntegrity(gameHash: string, participants: any[], result: any): boolean {
    // In a real implementation, this would verify the game result against the hash
    // For now, we'll just check if the hash exists and participants are valid
    return gameHash && gameHash.length > 0 && participants.length > 0;
  }

  // Animation helpers
  static generateRouletteSegments(participants: (PvpParticipant & { user: User; gift: Gift })[]): string {
    if (participants.length === 0) {
      return 'conic-gradient(from 0deg, #4B5563 0deg, #4B5563 360deg)';
    }

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
    ];

    const totalValue = participants.reduce((sum, p) => sum + parseFloat(p.gift.value), 0);
    let currentAngle = 0;
    const segments: string[] = [];

    participants.forEach((participant, index) => {
      const percentage = (parseFloat(participant.gift.value) / totalValue) * 100;
      const angle = (percentage / 100) * 360;
      const color = colors[index % colors.length];
      
      segments.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }

  static easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  static easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}

// Custom hooks for game logic
export function useRouletteGame() {
  const determineWinner = (participants: (PvpParticipant & { user: User; gift: Gift })[]) => {
    return GameLogic.determineRouletteWinner(participants);
  };

  const calculateWinChances = (participants: (PvpParticipant & { user: User; gift: Gift })[]) => {
    return GameLogic.calculateWinChances(participants);
  };

  const generateSegments = (participants: (PvpParticipant & { user: User; gift: Gift })[]) => {
    return GameLogic.generateRouletteSegments(participants);
  };

  return {
    determineWinner,
    calculateWinChances,
    generateSegments,
  };
}

export function useRollGame() {
  const generateResult = () => {
    return GameLogic.generateRollResult();
  };

  const calculateCost = (quantity: number, costPerRoll: number = 0.5) => {
    return quantity * costPerRoll;
  };

  return {
    generateResult,
    calculateCost,
  };
}

export function useStaking() {
  const calculateRewards = (stakedValue: number, days: number = 1) => {
    return GameLogic.calculateStakingRewards(stakedValue, 0.33, days);
  };

  const calculateRank = (userStakedValue: number, allStakedValues: number[]) => {
    return GameLogic.calculateStakingRank(userStakedValue, allStakedValues);
  };

  return {
    calculateRewards,
    calculateRank,
  };
}
