import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Share, Users, Trophy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { User, UserWithStats, Task } from "@shared/schema";

interface EarnTabProps {
  user: User;
  userStats?: UserWithStats;
}

export default function EarnTab({ user, userStats }: EarnTabProps) {
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      return response.json();
    },
  });

  const { data: completedTasks = [] } = useQuery({
    queryKey: ['/api/tasks/completed', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/completed/${user.id}`);
      return response.json();
    },
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['/api/referrals', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/referrals/${user.id}`);
      return response.json();
    },
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['/api/leaderboard'],
    queryFn: async () => {
      const response = await fetch('/api/leaderboard');
      return response.json();
    },
  });

  const { data: userStaking = [] } = useQuery({
    queryKey: ['/api/staking', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/staking/${user.id}`);
      return response.json();
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, taskId }),
      });
      if (!response.ok) throw new Error('Failed to complete task');
      return response.json();
    },
    onSuccess: (data, taskId) => {
      const task = tasks.find(t => t.id === taskId);
      toast({
        title: "Task Completed!",
        description: `You earned ${task?.reward} free roll(s)!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/completed'] });
    },
    onError: (error) => {
      toast({
        title: "Task Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const completedTaskIds = completedTasks.map((ct: any) => ct.taskId);
  const availableTasks = tasks.filter(task => !completedTaskIds.includes(task.id));

  const totalStaked = userStaking.reduce((sum: number, stake: any) => sum + parseFloat(stake.gift.value), 0);
  const dailyRewards = totalStaked * 0.33 / 365;

  const generateReferralLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${user.id}`;
  };

  const shareReferralLink = () => {
    const link = generateReferralLink();
    if (navigator.share) {
      navigator.share({
        title: 'Join RollsClone!',
        text: 'Play PvP roulette and win TON!',
        url: link,
      });
    } else {
      navigator.clipboard.writeText(link);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Earn TON</h2>
          <div className="dark-elevated rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Wallet Balance</span>
              <span className="text-lg font-semibold text-[var(--telegram-blue)]">
                {parseFloat(user.balance).toFixed(2)} TON
              </span>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              {user.walletAddress || "UQA1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"}
            </div>
          </div>
          <div className="dark-elevated rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Staked Value</span>
              <span className="text-lg font-semibold text-green-400">
                {totalStaked.toFixed(2)} TON
              </span>
            </div>
            <div className="text-xs text-gray-400">
              33% APR • {userStaking.length} gifts staked
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <Button
              variant="outline"
              size="sm"
              className="dark-elevated"
              onClick={() => {
                toast({
                  title: "Tasks Panel",
                  description: "Complete tasks to earn free rolls",
                });
              }}
            >
              Open Tasks
            </Button>
          </div>
          <div className="space-y-3">
            {availableTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 dark-elevated rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[var(--telegram-blue)] rounded-full flex items-center justify-center">
                    {task.type === 'share' ? (
                      <Share className="w-4 h-4 text-white" />
                    ) : (
                      <Users className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-gray-400">{task.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-green-400">
                    +{task.reward} 🎲
                  </Badge>
                  <Button
                    size="sm"
                    className="telegram-button"
                    onClick={() => completeTaskMutation.mutate(task.id)}
                  >
                    Complete
                  </Button>
                </div>
              </div>
            ))}
            {availableTasks.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">All tasks completed!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral Section */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Referral Program</h3>
          <div className="dark-elevated rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--telegram-blue)]">
                  {userStats?.referralCount || 0}
                </div>
                <div className="text-xs text-gray-400">Invited Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {userStats?.referralEarnings || "0.00"}
                </div>
                <div className="text-xs text-gray-400">TON Earned</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center mb-4">
              Earn 10% of fees from your referrals
            </div>
            <Button 
              className="w-full telegram-button"
              onClick={shareReferralLink}
            >
              <Users className="w-4 h-4 mr-2" />
              Invite Frens
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staking Section */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Staking Rewards</h3>
            <Button
              variant="outline"
              size="sm"
              className="dark-elevated"
              onClick={() => {
                toast({
                  title: "Leaderboard",
                  description: "View top stakers and rankings",
                });
              }}
            >
              Open Leaderboard
            </Button>
          </div>
          <div className="dark-elevated rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Your Rank</span>
              <span className="text-lg font-semibold text-[var(--telegram-blue)]">
                #{userStats?.rank || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Daily Rewards</span>
              <span className="text-lg font-semibold text-green-400">
                {dailyRewards.toFixed(2)} TON
              </span>
            </div>
            <div className="text-xs text-gray-400">33% APR on staked gifts</div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Preview */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Top Stakers
          </h3>
          <div className="space-y-3">
            {leaderboard.slice(0, 3).map((leader: UserWithStats, index: number) => (
              <div key={leader.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    'bg-orange-500'
                  }`}>
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <div className="w-8 h-8 bg-[var(--telegram-blue)] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {leader.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">@{leader.username}</span>
                </div>
                <span className="text-sm text-[var(--telegram-blue)]">
                  {parseFloat(leader.totalStaked).toFixed(0)} TON
                </span>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">No stakers yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
