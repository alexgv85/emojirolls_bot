import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, RefreshCw, Download, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { User, Gift as GiftType } from "@shared/schema";

interface GiftsTabProps {
  user: User;
}

export default function GiftsTab({ user }: GiftsTabProps) {
  const { toast } = useToast();

  const { data: gifts = [], refetch } = useQuery<GiftType[]>({
    queryKey: ['/api/gifts/user', user.id],
    queryFn: async () => {
      const response = await fetch(`/api/gifts/user/${user.id}`);
      return response.json();
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (giftId: number) => {
      // Mock withdrawal - in real app would integrate with TON wallet
      const response = await fetch('/api/gifts/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId }),
      });
      if (!response.ok) throw new Error('Failed to withdraw');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Successful",
        description: "Your gift has been withdrawn to your wallet",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gifts'] });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const availableGifts = gifts.filter(gift => !gift.isInGame);
  const hasGifts = availableGifts.length > 0;

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
    <div className="space-y-6">
      {/* Gift Inventory */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Gifts</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="dark-elevated"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>

          {!hasGifts ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 dark-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">There's no gifts yet</h3>
              <p className="text-gray-400 text-sm mb-4">Want to add your NFT gift? Send it to</p>
              <div className="dark-elevated px-4 py-2 rounded-lg inline-block mb-4">
                <span className="text-[var(--telegram-blue)] font-mono">@rolls_transfer</span>
              </div>
              <Button 
                disabled
                className="bg-gray-600 text-gray-400 cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          ) : (
            /* Gift Items */
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {availableGifts.map((gift) => (
                  <div key={gift.id} className="dark-elevated rounded-lg p-4">
                    <div className={`w-full h-24 ${getGradientClass(gift.background || 'gold')} rounded-lg mb-3 flex items-center justify-center text-3xl`}>
                      {gift.icon}
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{gift.name}</h4>
                    <p className="text-xs text-gray-400 mb-2">ID: #{gift.id}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--telegram-blue)] font-semibold text-sm">
                        {parseFloat(gift.value).toFixed(1)} TON
                      </span>
                      <Button 
                        size="sm"
                        className="telegram-button px-3 py-1 text-xs"
                        onClick={() => withdrawMutation.mutate(gift.id)}
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full telegram-button"
                onClick={() => {
                  // Mock withdraw all functionality
                  toast({
                    title: "Feature Coming Soon",
                    description: "Withdraw all functionality will be available soon",
                  });
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Withdraw All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Instructions */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-3">How to add gifts</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[var(--telegram-blue)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <p>
                Send your NFT to the transfer bot{" "}
                <span className="text-[var(--telegram-blue)]">@rolls_transfer</span>
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[var(--telegram-blue)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <p>The bot will automatically convert it to a gift with TON value</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[var(--telegram-blue)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <p>Your gift will appear in your inventory within 5 minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
