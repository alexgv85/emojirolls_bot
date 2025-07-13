import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dice1, AlertTriangle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface RollsTabProps {
  user: User;
}

export default function RollsTab({ user }: RollsTabProps) {
  const [quantity, setQuantity] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const { toast } = useToast();

  const costPerRoll = 0.5;
  const totalCost = quantity * costPerRoll;
  const userBalance = parseFloat(user.balance);
  const hasInsufficientBalance = totalCost > userBalance;

  const { data: recentRolls } = useQuery({
    queryKey: ['/api/rolls/recent'],
    queryFn: async () => {
      const response = await fetch('/api/rolls/recent?limit=10');
      return response.json();
    },
    refetchInterval: 5000,
  });

  const rollMutation = useMutation({
    mutationFn: async ({ userId, quantity }: { userId: number; quantity: number }) => {
      const response = await fetch('/api/rolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, quantity }),
      });
      if (!response.ok) throw new Error('Failed to roll');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Roll Complete!",
        description: `You rolled ${quantity} time(s) and won ${data.results.length} prizes!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rolls/recent'] });
      setIsRolling(false);
    },
    onError: (error) => {
      toast({
        title: "Roll Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsRolling(false);
    },
  });

  const handleRoll = () => {
    if (hasInsufficientBalance) return;
    setIsRolling(true);
    rollMutation.mutate({ userId: user.id, quantity });
  };

  const setQuickQuantity = (value: number) => {
    if (value === -1) {
      // MAX button
      const maxPossible = Math.floor(userBalance / costPerRoll);
      setQuantity(Math.min(maxPossible, 50));
    } else {
      setQuantity(Math.min(quantity + value, 50));
    }
  };

  return (
    <div className="space-y-6">
      {/* Roll Controls */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Rolls</h2>
            <div className="text-sm text-gray-400">
              1 Roll | {costPerRoll} TON
            </div>
          </div>
          
          {/* Quantity Controls */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center space-x-2">
              <Slider
                value={[quantity]}
                onValueChange={(value) => setQuantity(value[0])}
                max={50}
                min={1}
                step={1}
                className="flex-1"
              />
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
            </div>
            <div className="flex space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickQuantity(1)}
                className="dark-elevated"
              >
                +1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickQuantity(5)}
                className="dark-elevated"
              >
                +5
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickQuantity(10)}
                className="dark-elevated"
              >
                +10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuickQuantity(-1)}
                className="dark-elevated"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Roll Button */}
          <Button 
            onClick={handleRoll}
            disabled={hasInsufficientBalance || isRolling}
            className="w-full telegram-button mb-4"
          >
            <Dice1 className="w-4 h-4 mr-2" />
            {isRolling ? "Rolling..." : `Roll Now - ${totalCost.toFixed(1)} TON`}
          </Button>

          {/* Insufficient Balance Warning */}
          {hasInsufficientBalance && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Not enough balance
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roll Wheel */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <div className="relative w-80 h-80 mx-auto mb-4">
            <div className={`w-full h-full rounded-full border-4 border-[var(--telegram-blue)] relative overflow-hidden ${isRolling ? 'roulette-spin' : ''}`}>
              {/* Wheel with 15 prize segments */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                {Array.from({ length: 15 }, (_, i) => {
                  const angle = (360 / 15) * i;
                  const nextAngle = (360 / 15) * (i + 1);
                  const startRad = (angle * Math.PI) / 180;
                  const endRad = (nextAngle * Math.PI) / 180;
                  
                  const x1 = 100 + 90 * Math.cos(startRad);
                  const y1 = 100 + 90 * Math.sin(startRad);
                  const x2 = 100 + 90 * Math.cos(endRad);
                  const y2 = 100 + 90 * Math.sin(endRad);
                  
                  const colors = [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
                    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF7675',
                    '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7', '#74B9FF'
                  ];
                  
                  return (
                    <path
                      key={i}
                      d={`M 100 100 L ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2} Z`}
                      fill={colors[i]}
                      stroke="#1a1a1a"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>
              
              {/* Prize Icons positioned around the wheel */}
              <div className="absolute inset-0">
                {[
                  { icon: "🎁", angle: 12 }, { icon: "💎", angle: 36 }, { icon: "🏆", angle: 60 },
                  { icon: "⭐", angle: 84 }, { icon: "🔥", angle: 108 }, { icon: "⚡", angle: 132 },
                  { icon: "🌟", angle: 156 }, { icon: "💰", angle: 180 }, { icon: "🎭", angle: 204 },
                  { icon: "🔮", angle: 228 }, { icon: "👑", angle: 252 }, { icon: "🗡️", angle: 276 },
                  { icon: "🛡️", angle: 300 }, { icon: "💍", angle: 324 }, { icon: "🎪", angle: 348 }
                ].map((prize, index) => {
                  const rad = (prize.angle * Math.PI) / 180;
                  const x = 50 + 30 * Math.cos(rad);
                  const y = 50 + 30 * Math.sin(rad);
                  
                  return (
                    <div
                      key={index}
                      className="absolute text-lg font-bold transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                      }}
                    >
                      {prize.icon}
                    </div>
                  );
                })}
              </div>
              
              {/* Center Circle */}
              <div className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[var(--dark-bg)] rounded-full flex items-center justify-center border-4 border-[var(--telegram-blue)] z-10">
                <Dice1 className="w-8 h-8 text-[var(--telegram-blue)]" />
              </div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[24px] border-l-transparent border-r-transparent border-b-white z-20"></div>
            </div>
          </div>
          
          {/* Prize Probabilities Display */}
          <div className="text-center text-xs text-gray-400 mb-4">
            <div className="grid grid-cols-3 gap-2">
              <div>Common: 70%</div>
              <div>Rare: 25%</div>
              <div>Epic: 5%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Wins */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Live Wins
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentRolls?.map((roll: any) => (
              <div key={roll.id} className="flex items-center justify-between p-2 dark-elevated rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[var(--telegram-blue)] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {roll.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm">@{roll.user.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{roll.results[0]?.icon || "🎁"}</span>
                  <span className="text-sm text-[var(--telegram-blue)]">
                    {roll.results[0]?.name || "Prize"}
                  </span>
                </div>
              </div>
            ))}
            {!recentRolls?.length && (
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">No recent rolls yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
