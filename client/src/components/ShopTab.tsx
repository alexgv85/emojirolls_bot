import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Info, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { User, ShopItem } from "@shared/schema";

interface ShopTabProps {
  user: User;
}

export default function ShopTab({ user }: ShopTabProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [skinFilter, setSkinFilter] = useState<string>("all");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortAsc, setSortAsc] = useState(true);
  const { toast } = useToast();

  const { data: shopItems = [] } = useQuery<ShopItem[]>({
    queryKey: ['/api/shop/items'],
    queryFn: async () => {
      const response = await fetch('/api/shop/items');
      return response.json();
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, itemId }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Purchase failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful!",
        description: `You bought ${data.name} for ${data.value} TON`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gifts'] });
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredItems = shopItems
    .filter(item => typeFilter === "all" || item.type === typeFilter)
    .filter(item => skinFilter === "all" || item.skin === skinFilter || item.background === skinFilter)
    .filter(item => rarityFilter === "all" || item.rarity === rarityFilter)
    .filter(item => {
      if (priceRange === "all") return true;
      const price = parseFloat(item.price);
      switch (priceRange) {
        case "basic": return price >= 3 && price <= 10;
        case "rare": return price >= 11 && price <= 25;
        case "epic": return price >= 26 && price <= 50;
        case "legendary": return price >= 51 && price <= 100;
        default: return true;
      }
    })
    .sort((a, b) => {
      const aPrice = parseFloat(a.price);
      const bPrice = parseFloat(b.price);
      return sortAsc ? aPrice - bPrice : bPrice - aPrice;
    });

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

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const backgroundColors = [
    { name: 'red', color: 'bg-red-500' },
    { name: 'blue', color: 'bg-blue-500' },
    { name: 'green', color: 'bg-green-500' },
    { name: 'gold', color: 'bg-yellow-500' },
    { name: 'purple', color: 'bg-purple-500' },
    { name: 'orange', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Shop Header */}
      <Card className="dark-surface">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Gift Shop</h2>
            <div className="text-sm text-gray-400">
              {filteredItems.length} items available
            </div>
          </div>
          
          {/* Filters Row 1 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="dark-elevated">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="weapon">Weapon</SelectItem>
                <SelectItem value="armor">Armor</SelectItem>
                <SelectItem value="gem">Gem</SelectItem>
                <SelectItem value="jewelry">Jewelry</SelectItem>
                <SelectItem value="mystical">Mystical</SelectItem>
                <SelectItem value="creature">Creature</SelectItem>
                <SelectItem value="cosmic">Cosmic</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="nature">Nature</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="building">Building</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="dark-elevated">
                <SelectValue placeholder="All Rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarity</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters Row 2 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Select value={skinFilter} onValueChange={setSkinFilter}>
              <SelectTrigger className="dark-elevated">
                <SelectValue placeholder="All Collections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                <SelectItem value="default">Basic</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
                <SelectItem value="creature">Creature</SelectItem>
                <SelectItem value="cosmic">Cosmic</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="nature">Nature</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="building">Building</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="dark-elevated">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="basic">Basic (3-10 TON)</SelectItem>
                <SelectItem value="rare">Rare (11-25 TON)</SelectItem>
                <SelectItem value="epic">Epic (26-50 TON)</SelectItem>
                <SelectItem value="legendary">Legendary (51-100 TON)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort and Clear Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Sort by Price:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortAsc(!sortAsc)}
                className="dark-elevated"
              >
                <ArrowUpDown className="w-4 h-4 mr-1" />
                {sortAsc ? 'Low to High' : 'High to Low'}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypeFilter("all");
                setSkinFilter("all");
                setRarityFilter("all");
                setPriceRange("all");
              }}
              className="text-gray-400 hover:text-white"
            >
              Clear Filters
            </Button>
          </div>

          {/* Background Color Filter */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm text-gray-400">Background Color:</span>
            <div className="flex space-x-2">
              <button
                className={`w-8 h-8 rounded-full border-2 transition-colors bg-gray-600 ${
                  skinFilter === 'all' ? 'border-white' : 'border-transparent hover:border-white'
                }`}
                onClick={() => setSkinFilter('all')}
                title="All Colors"
              />
              {backgroundColors.map((bg) => (
                <button
                  key={bg.name}
                  className={`w-8 h-8 rounded-full border-2 transition-colors ${bg.color} ${
                    skinFilter === bg.name ? 'border-white' : 'border-transparent hover:border-white'
                  }`}
                  onClick={() => setSkinFilter(bg.name)}
                  title={bg.name}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Items */}
      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="dark-surface">
            <CardContent className="p-4">
              <div className="relative mb-3">
                <div className={`w-full h-32 ${getGradientClass(item.background || 'gold')} rounded-lg flex items-center justify-center text-4xl`}>
                  {item.icon}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 w-6 h-6 p-0 bg-black/50 rounded-full"
                  onClick={() => {
                    toast({
                      title: item.name,
                      description: item.description || `A ${item.rarity} ${item.type}`,
                    });
                  }}
                >
                  <Info className="w-3 h-3 text-[var(--telegram-blue)]" />
                </Button>
                <Badge className={`absolute top-2 left-2 ${getRarityColor(item.rarity)}`}>
                  {item.rarity}
                </Badge>
              </div>
              <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
              <p className="text-xs text-gray-400 mb-2">ID: #{item.id}</p>
              <div className="flex items-center justify-between">
                <span className="text-[var(--telegram-blue)] font-semibold">
                  {parseFloat(item.price).toFixed(1)} TON
                </span>
                <Button 
                  size="sm"
                  className="telegram-button px-4 py-2 text-sm"
                  onClick={() => purchaseMutation.mutate(item.id)}
                  disabled={parseFloat(user.balance) < parseFloat(item.price)}
                >
                  Buy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="dark-surface">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-gray-400">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
