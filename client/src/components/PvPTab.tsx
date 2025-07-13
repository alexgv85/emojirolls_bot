import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Users, Clock } from "lucide-react";
import RouletteWheel from "./RouletteWheel";
import AddGiftModal from "./AddGiftModal";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { User, PvpGameWithParticipants } from "@shared/schema";

interface PvPTabProps {
  user: User;
}

export default function PvPTab({ user }: PvPTabProps) {
  const [showAddGiftModal, setShowAddGiftModal] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { lastMessage } = useWebSocket(user.id);

  const { data: currentGame, refetch: refetchGame } = useQuery<PvpGameWithParticipants>({
    queryKey: ['/api/pvp/current'],
    refetchInterval: 1000,
  });

  const { data: gameHistory } = useQuery({
    queryKey: ['/api/pvp/history'],
    queryFn: async () => {
      const response = await fetch('/api/pvp/history?limit=5');
      return response.json();
    },
  });

  // Handle WebSocket messages
  useState(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'pvp_participant_joined' || data.type === 'pvp_game_completed') {
        refetchGame();
      }
    }
  }, [lastMessage, refetchGame]);

  // Update countdown
  useState(() => {
    if (currentGame?.countdownEnds) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(currentGame.countdownEnds!).getTime();
        const diff = Math.max(0, Math.floor((end - now) / 1000));
        setCountdown(diff);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentGame]);

  const totalGifts = currentGame?.participants?.length || 0;
  const totalValue = currentGame?.participants?.reduce((sum, p) => sum + parseFloat(p.gift.value), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Live PvP Game</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full pulse-live"></div>
              <span className="text-sm text-gray-400">Live</span>
            </div>
          </div>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-[var(--telegram-blue)] mb-2">
              {countdown}
            </div>
            <p className="text-sm text-gray-400">
              {countdown > 0 ? "Seconds until spin" : "Game in progress"}
            </p>
          </div>
          <div className="flex justify-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-[var(--telegram-blue)] font-semibold">{totalGifts}</div>
              <div className="text-gray-400">Gifts</div>
            </div>
            <div className="text-center">
              <div className="text-[var(--telegram-blue)] font-semibold">{totalValue.toFixed(1)}</div>
              <div className="text-gray-400">TON</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roulette Wheel */}
      <Card className="dark-surface">
        <CardContent className="p-6">
          <RouletteWheel 
            participants={currentGame?.participants || []} 
            isSpinning={countdown === 0 && currentGame?.status === "waiting"}
          />
          <div className="text-center mt-4">
            <Button 
              onClick={() => setShowAddGiftModal(true)}
              className="telegram-button"
              disabled={countdown === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Gift
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Players ({totalGifts})
          </h3>
          <div className="space-y-3">
            {currentGame?.participants?.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 dark-elevated rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[var(--telegram-blue)] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {participant.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">@{participant.user.username}</div>
                    <div className="text-sm text-gray-400">
                      {parseFloat(participant.winChance).toFixed(1)}% chance
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--telegram-blue)] font-semibold">
                    {parseFloat(participant.gift.value).toFixed(1)} TON
                  </div>
                  <div className="text-xs text-gray-400 flex items-center">
                    <span className="mr-1">{participant.gift.icon}</span>
                    {participant.gift.name}
                  </div>
                </div>
              </div>
            ))}
            {totalGifts === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No players yet. Be the first to join!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Hash */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Game Hash</h4>
              <p className="text-xs text-gray-400">Provably fair</p>
            </div>
            <div className="text-right">
              <code className="text-xs dark-elevated px-2 py-1 rounded">
                {currentGame?.gameHash?.substring(0, 12)}...
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Winners */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Winners</h3>
          <div className="space-y-3">
            {gameHistory?.slice(0, 3).map((game: any) => {
              const winner = game.participants.find((p: any) => p.userId === game.winnerId);
              return (
                <div key={game.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[var(--telegram-blue)] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {winner?.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm">@{winner?.user.username}</span>
                  </div>
                  <span className="text-sm text-green-400">
                    +{parseFloat(game.totalValue).toFixed(1)} TON
                  </span>
                </div>
              );
            })}
            {!gameHistory?.length && (
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">No recent winners yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Gift Modal */}
      <AddGiftModal 
        isOpen={showAddGiftModal}
        onClose={() => setShowAddGiftModal(false)}
        userId={user.id}
        currentGameId={currentGame?.id}
      />
    </div>
  );
}
