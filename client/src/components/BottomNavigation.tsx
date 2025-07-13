import { Button } from "@/components/ui/button";
import { Users, Dice1, Gift, ShoppingCart, Coins } from "lucide-react";

type Tab = "pvp" | "rolls" | "gifts" | "shop" | "earn";

interface BottomNavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export default function BottomNavigation({ activeTab, setActiveTab }: BottomNavigationProps) {
  const tabs = [
    { id: "pvp" as Tab, label: "PvP", icon: Users },
    { id: "rolls" as Tab, label: "Rolls", icon: Dice1 },
    { id: "gifts" as Tab, label: "My Gifts", icon: Gift },
    { id: "shop" as Tab, label: "Shop", icon: ShoppingCart },
    { id: "earn" as Tab, label: "Earn", icon: Coins },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 dark-surface border-t border-gray-800 px-4 py-2">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`nav-tab flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id ? 'active' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
