import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, ShoppingBag, Check, Crown, Sparkles, Eye, Heart, Star, Gem, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Accessory, UserAccessory } from "@shared/schema";

const rarityColors: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  epic: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  legendary: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const categoryIcons: Record<string, typeof Crown> = {
  hat: Crown,
  glasses: Eye,
  necklace: Heart,
  background: Sparkles,
};

function AccessoryCard({ 
  accessory, 
  owned, 
  equipped,
  userAccessoryId,
  userCoins,
  onPurchase,
  onEquip,
  isPurchasing,
}: { 
  accessory: Accessory;
  owned: boolean;
  equipped: boolean;
  userAccessoryId?: string;
  userCoins: number;
  onPurchase: (id: string) => void;
  onEquip: (id: string, equip: boolean) => void;
  isPurchasing: boolean;
}) {
  const canAfford = userCoins >= accessory.price;
  const CategoryIcon = categoryIcons[accessory.category] || Star;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-4 relative ${equipped ? 'ring-2 ring-primary' : ''}`} data-testid={`card-accessory-${accessory.id}`}>
        {equipped && (
          <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
            Equipped
          </Badge>
        )}
        
        <div className="flex flex-col items-center text-center gap-3">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            accessory.rarity === 'legendary' ? 'bg-xp-gold/20' :
            accessory.rarity === 'epic' ? 'bg-purple-500/20' :
            accessory.rarity === 'rare' ? 'bg-blue-500/20' :
            'bg-muted'
          }`}>
            <CategoryIcon className={`w-7 h-7 ${
              accessory.rarity === 'legendary' ? 'text-xp-gold' :
              accessory.rarity === 'epic' ? 'text-purple-500' :
              accessory.rarity === 'rare' ? 'text-blue-500' :
              'text-muted-foreground'
            }`} />
          </div>
          
          <div>
            <h4 className="font-display font-semibold text-sm">{accessory.name}</h4>
            <Badge variant="secondary" className={`text-xs mt-1 ${rarityColors[accessory.rarity]}`}>
              {accessory.rarity}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {accessory.description}
          </p>
          
          <div className="w-full mt-auto">
            {owned ? (
              <Button
                variant={equipped ? "outline" : "default"}
                size="sm"
                className="w-full"
                onClick={() => userAccessoryId && onEquip(userAccessoryId, !equipped)}
                data-testid={`button-equip-${accessory.id}`}
              >
                {equipped ? "Unequip" : "Equip"}
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="w-full gap-1"
                onClick={() => onPurchase(accessory.id)}
                disabled={!canAfford || isPurchasing}
                data-testid={`button-purchase-${accessory.id}`}
              >
                {!canAfford && <Lock className="w-3 h-3" />}
                <Coins className="w-3 h-3" />
                {accessory.price}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Shop() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: allAccessories = [], isLoading: accessoriesLoading } = useQuery<Accessory[]>({
    queryKey: ["/api/shop/accessories"],
  });

  const { data: ownedAccessories = [], isLoading: ownedLoading } = useQuery<(UserAccessory & { accessory: Accessory })[]>({
    queryKey: ["/api/shop/owned"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (accessoryId: string) => {
      return apiRequest("POST", "/api/shop/purchase", { accessoryId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/owned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/equipped"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Purchase successful!",
        description: "Your new accessory has been added to your collection.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Could not complete purchase",
        variant: "destructive",
      });
    },
  });

  const equipMutation = useMutation({
    mutationFn: async ({ userAccessoryId, equipped }: { userAccessoryId: string; equipped: boolean }) => {
      return apiRequest("POST", "/api/shop/equip", { userAccessoryId, equipped });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/owned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/equipped"] });
      toast({
        title: "Updated!",
        description: "Your accessory has been updated.",
      });
    },
  });

  const ownedIds = new Set(ownedAccessories.map(o => o.accessoryId));
  const equippedIds = new Set(ownedAccessories.filter(o => o.equipped).map(o => o.accessoryId));
  const userAccessoryMap = Object.fromEntries(ownedAccessories.map(o => [o.accessoryId, o.id]));

  const isLoading = accessoriesLoading || ownedLoading;

  const categories = ["hat", "glasses", "necklace", "background"];

  const handlePurchase = (accessoryId: string) => {
    purchaseMutation.mutate(accessoryId);
  };

  const handleEquip = (userAccessoryId: string, equipped: boolean) => {
    equipMutation.mutate({ userAccessoryId, equipped });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-2xl flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              Accessory Shop
            </h1>
          </div>
          
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1.5 text-base">
            <Coins className="w-4 h-4 text-xp-gold" />
            <span className="font-semibold" data-testid="text-coin-balance">{user?.coins || 0}</span>
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 mb-6 bg-gradient-to-r from-lavender/20 to-mint/20 border-lavender/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-xp-gold/20 flex items-center justify-center">
                <Gem className="w-5 h-5 text-xp-gold" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Customize Your Buddy</h3>
                <p className="text-sm text-muted-foreground">
                  Earn coins by learning and buy accessories to dress up your creature!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-muted" />
                  <div className="w-20 h-4 bg-muted rounded" />
                  <div className="w-16 h-3 bg-muted rounded" />
                  <div className="w-full h-8 bg-muted rounded mt-2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="hat" className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-4">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="flex items-center gap-1 capitalize"
                    data-testid={`tab-${cat}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat}s</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <motion.div
                  key={category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {allAccessories
                    .filter(a => a.category === category)
                    .sort((a, b) => a.price - b.price)
                    .map((accessory) => (
                      <AccessoryCard
                        key={accessory.id}
                        accessory={accessory}
                        owned={ownedIds.has(accessory.id)}
                        equipped={equippedIds.has(accessory.id)}
                        userAccessoryId={userAccessoryMap[accessory.id]}
                        userCoins={user?.coins || 0}
                        onPurchase={handlePurchase}
                        onEquip={handleEquip}
                        isPurchasing={purchaseMutation.isPending}
                      />
                    ))}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {ownedAccessories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-mint" />
              Your Collection ({ownedAccessories.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {ownedAccessories.map((owned) => (
                <Badge 
                  key={owned.id} 
                  variant="secondary"
                  className={`${owned.equipped ? 'ring-1 ring-primary' : ''}`}
                >
                  {owned.accessory.name}
                  {owned.equipped && <Check className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
