import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, User, Dice1 } from "lucide-react";
import PvPTab from "@/components/PvPTab";
import RollsTab from "@/components/RollsTab";
import GiftsTab from "@/components/GiftsTab";
import ShopTab from "@/components/ShopTab";
import EarnTab from "@/components/EarnTab";
import BottomNavigation from "@/components/BottomNavigation";
import { useTelegram } from "@/hooks/useTelegram";
import { useWebSocket } from "@/hooks/useWebSocket";

type Tab = "pvp" | "rolls" | "gifts" | "shop" | "earn";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("pvp");
  const { user, isAuthenticated } = useTelegram();
  const { isConnected } = useWebSocket(user?.id);

  const { data: userStats } = useQuery({
    queryKey: ['/api/users', user?.id, 'stats'],
    enabled: !!user?.id,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--dark-bg)] text-white flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 dark-surface">
          <CardContent className="pt-6">
            <div className="text-center">
              <Dice1 className="w-16 h-16 mx-auto mb-4 text-[var(--telegram-blue)]" />
              <h1 className="text-2xl font-bold mb-2">Welcome to RollsClone</h1>
              <p className="text-gray-400 mb-4">
                Initializing Telegram Mini App...
              </p>
              <div className="w-8 h-8 border-2 border-[var(--telegram-blue)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "pvp":
        return <PvPTab user={user} />;
      case "rolls":
        return <RollsTab user={user} />;
      case "gifts":
        return <GiftsTab user={user} />;
      case "shop":
        return <ShopTab user={user} />;
      case "earn":
        return <EarnTab user={user} userStats={userStats} />;
      default:
        return <PvPTab user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--dark-bg)] text-white pb-20">
      {/* Header */}
      <header className="dark-surface border-b border-gray-800 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[var(--telegram-blue)] rounded-full flex items-center justify-center">
              <Dice1 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold">RollsClone</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 dark-elevated px-3 py-2 rounded-lg">
              <Wallet className="w-4 h-4 text-[var(--telegram-blue)]" />
              <span className="text-sm font-medium">
                {parseFloat(user.balance).toFixed(2)} TON
              </span>
            </div>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 dark-elevated rounded-full">
              <User className="w-4 h-4 text-[var(--telegram-blue)]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-500/20 border-l-4 border-yellow-500 p-2 text-sm text-yellow-400">
          Connecting to live updates...
        </div>
      )}

      {/* Main Content */}
      <main className="px-4 py-6">
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
