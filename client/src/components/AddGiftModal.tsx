import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Gift } from "@shared/schema";

interface AddGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  currentGameId?: number;
}

export default function AddGiftModal({ isOpen, onClose, userId, currentGameId }: AddGiftModalProps) {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const { toast } = useToast();

  const { data: gifts = [] } = useQuery<Gift[]>({
    queryKey: ['/api/gifts/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/gifts/user/${userId}`);
      return response.json();
    },
    enabled: isOpen,
  });

  const joinGameMutation = useMutation({
    mutationFn: async ({ gameId, userId, giftId }: { gameId: number; userId: number; giftId: number }) => {
      const response = await fetch('/api/pvp/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, userId, giftId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join game');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Joined Game!",
        description: "Your gift has been added to the PvP game",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pvp/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifts'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Join Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const availableGifts = gifts.filter(gift => !gift.isInGame);

  const handleJoinGame = () => {
    if (!selectedGift || !currentGameId) return;
    joinGameMutation.mutate({
      gameId: currentGameId,
      userId,
      giftId: selectedGift.id,
    });
  };

  const getGradientClass = (background: string) => {
    switch (background) {
      case 'gold': return 'gradient-gold';
      case 'blue': return 'gradient-blue';
      case 'green': return 'gradient-green';
      case 'red': return 'gradient-red';
      case 'orange': return 'gradient-orange';
      case 'purple': return 'gradient-purple';
      default: return 'gradient-gold';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark-surface max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Gift to Game</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {availableGifts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No available gifts</p>
              <p className="text-xs">Purchase gifts from the shop or roll to get some!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {availableGifts.map((gift) => (
                  <div
                    key={gift.id}
                    className={`dark-elevated rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedGift?.id === gift.id 
                        ? 'border-2 border-[var(--telegram-blue)]' 
                        : 'border-2 border-transparent hover:border-[var(--telegram-blue)]/50'
                    }`}
                    onClick={() => setSelectedGift(gift)}
                  >
                    <div className={`w-full h-16 ${getGradientClass(gift.background || 'gold')} rounded-lg flex items-center justify-center text-2xl mb-2`}>
                      {gift.icon}
                    </div>
                    <div className="text-xs text-center">
                      <div className="font-medium">{gift.name}</div>
                      <div className="text-[var(--telegram-blue)]">
                        {parseFloat(gift.value).toFixed(1)} TON
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={handleJoinGame}
                disabled={!selectedGift || joinGameMutation.isPending}
                className="w-full telegram-button"
              >
                {joinGameMutation.isPending ? "Adding..." : "Add to Game"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
