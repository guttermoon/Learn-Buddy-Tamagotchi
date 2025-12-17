import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, ShoppingBag, Check, Crown, Sparkles, Eye, Heart, Star, Gem, Lock, Gift, ArrowLeftRight, Inbox, Send, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Accessory, UserAccessory, AccessoryGift, AccessoryTrade } from "@shared/schema";

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
  onGift,
  isPurchasing,
}: { 
  accessory: Accessory;
  owned: boolean;
  equipped: boolean;
  userAccessoryId?: string;
  userCoins: number;
  onPurchase: (id: string) => void;
  onEquip: (id: string, equip: boolean) => void;
  onGift?: (userAccessoryId: string) => void;
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
          
          <div className="w-full mt-auto space-y-2">
            {owned ? (
              <>
                <Button
                  variant={equipped ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => userAccessoryId && onEquip(userAccessoryId, !equipped)}
                  data-testid={`button-equip-${accessory.id}`}
                >
                  {equipped ? "Unequip" : "Equip"}
                </Button>
                {!equipped && onGift && userAccessoryId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-1"
                    onClick={() => onGift(userAccessoryId)}
                    data-testid={`button-gift-${accessory.id}`}
                  >
                    <Gift className="w-3 h-3" />
                    Gift
                  </Button>
                )}
              </>
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

type GiftWithDetails = AccessoryGift & { accessory: Accessory; sender: User };
type TradeWithDetails = AccessoryTrade & { proposerAccessory: Accessory; recipientAccessory: Accessory; proposer: User };

export default function Shop() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mainTab, setMainTab] = useState("shop");
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string | null>(null);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: allAccessories = [], isLoading: accessoriesLoading } = useQuery<Accessory[]>({
    queryKey: ["/api/shop/accessories"],
  });

  const { data: ownedAccessories = [], isLoading: ownedLoading } = useQuery<(UserAccessory & { accessory: Accessory })[]>({
    queryKey: ["/api/shop/owned"],
  });

  const { data: pendingGifts = [] } = useQuery<GiftWithDetails[]>({
    queryKey: ["/api/gifts/inbox"],
  });

  const { data: pendingTrades = [] } = useQuery<TradeWithDetails[]>({
    queryKey: ["/api/trades/inbox"],
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

  const giftMutation = useMutation({
    mutationFn: async (data: { recipientUsername: string; userAccessoryId: string; message?: string }) => {
      return apiRequest("POST", "/api/gifts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shop/owned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gifts/sent"] });
      setGiftDialogOpen(false);
      setRecipientUsername("");
      setGiftMessage("");
      setSelectedAccessoryId(null);
      toast({
        title: "Gift sent!",
        description: "Your gift is on its way.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gift failed",
        description: error.message || "Could not send gift",
        variant: "destructive",
      });
    },
  });

  const acceptGiftMutation = useMutation({
    mutationFn: async (giftId: string) => {
      return apiRequest("POST", `/api/gifts/${giftId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gifts/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/owned"] });
      toast({
        title: "Gift accepted!",
        description: "The accessory has been added to your collection.",
      });
    },
  });

  const declineGiftMutation = useMutation({
    mutationFn: async (giftId: string) => {
      return apiRequest("POST", `/api/gifts/${giftId}/decline`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gifts/inbox"] });
      toast({
        title: "Gift declined",
        description: "The gift has been returned to the sender.",
      });
    },
  });

  const acceptTradeMutation = useMutation({
    mutationFn: async (tradeId: string) => {
      return apiRequest("POST", `/api/trades/${tradeId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shop/owned"] });
      toast({
        title: "Trade accepted!",
        description: "Accessories have been exchanged.",
      });
    },
  });

  const declineTradeMutation = useMutation({
    mutationFn: async (tradeId: string) => {
      return apiRequest("POST", `/api/trades/${tradeId}/decline`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades/inbox"] });
      toast({
        title: "Trade declined",
        description: "The trade offer has been rejected.",
      });
    },
  });

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const ownedIds = new Set(ownedAccessories.map(o => o.accessoryId));
  const equippedIds = new Set(ownedAccessories.filter(o => o.equipped).map(o => o.accessoryId));
  const userAccessoryMap = Object.fromEntries(ownedAccessories.map(o => [o.accessoryId, o.id]));

  const isLoading = accessoriesLoading || ownedLoading;
  const categories = ["hat", "glasses", "necklace", "background"];
  const totalInbox = pendingGifts.length + pendingTrades.length;

  const handlePurchase = (accessoryId: string) => {
    purchaseMutation.mutate(accessoryId);
  };

  const handleEquip = (userAccessoryId: string, equipped: boolean) => {
    equipMutation.mutate({ userAccessoryId, equipped });
  };

  const handleOpenGiftDialog = (userAccessoryId: string) => {
    setSelectedAccessoryId(userAccessoryId);
    setGiftDialogOpen(true);
  };

  const handleSendGift = () => {
    if (!selectedAccessoryId || !recipientUsername) return;
    giftMutation.mutate({
      recipientUsername,
      userAccessoryId: selectedAccessoryId,
      message: giftMessage || undefined,
    });
  };

  const selectedAccessory = ownedAccessories.find(o => o.id === selectedAccessoryId);

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

        <Tabs value={mainTab} onValueChange={setMainTab} className="w-full mb-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="shop" className="flex items-center gap-1" data-testid="tab-shop">
              <ShoppingBag className="w-4 h-4" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="collection" className="flex items-center gap-1" data-testid="tab-collection">
              <Star className="w-4 h-4" />
              Collection
            </TabsTrigger>
            <TabsTrigger value="inbox" className="flex items-center gap-1 relative" data-testid="tab-inbox">
              <Inbox className="w-4 h-4" />
              Inbox
              {totalInbox > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
                  {totalInbox}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
                        data-testid={`tab-category-${cat}`}
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
                            onGift={handleOpenGiftDialog}
                            isPurchasing={purchaseMutation.isPending}
                          />
                        ))}
                    </motion.div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </TabsContent>

          <TabsContent value="collection" className="mt-4">
            {ownedAccessories.length === 0 ? (
              <Card className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-display font-semibold text-lg mb-2">No accessories yet</h3>
                <p className="text-muted-foreground mb-4">Visit the shop to buy accessories for your buddy!</p>
                <Button onClick={() => setMainTab("shop")}>Browse Shop</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ownedAccessories.map((owned) => (
                  <AccessoryCard
                    key={owned.id}
                    accessory={owned.accessory}
                    owned={true}
                    equipped={owned.equipped}
                    userAccessoryId={owned.id}
                    userCoins={user?.coins || 0}
                    onPurchase={() => {}}
                    onEquip={handleEquip}
                    onGift={handleOpenGiftDialog}
                    isPurchasing={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inbox" className="mt-4 space-y-6">
            <div>
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-peach" />
                Pending Gifts ({pendingGifts.length})
              </h3>
              {pendingGifts.length === 0 ? (
                <Card className="p-4 text-center text-muted-foreground">
                  No pending gifts
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingGifts.map((gift) => (
                    <Card key={gift.id} className="p-4" data-testid={`card-gift-${gift.id}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-peach/20 flex items-center justify-center">
                            <Gift className="w-5 h-5 text-peach" />
                          </div>
                          <div>
                            <p className="font-semibold">{gift.accessory.name}</p>
                            <p className="text-sm text-muted-foreground">
                              From {gift.sender.displayName || gift.sender.username}
                            </p>
                            {gift.message && (
                              <p className="text-sm italic mt-1">"{gift.message}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptGiftMutation.mutate(gift.id)}
                            disabled={acceptGiftMutation.isPending}
                            data-testid={`button-accept-gift-${gift.id}`}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => declineGiftMutation.mutate(gift.id)}
                            disabled={declineGiftMutation.isPending}
                            data-testid={`button-decline-gift-${gift.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-sky" />
                Trade Offers ({pendingTrades.length})
              </h3>
              {pendingTrades.length === 0 ? (
                <Card className="p-4 text-center text-muted-foreground">
                  No pending trades
                </Card>
              ) : (
                <div className="space-y-3">
                  {pendingTrades.map((trade) => (
                    <Card key={trade.id} className="p-4" data-testid={`card-trade-${trade.id}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sky/20 flex items-center justify-center">
                            <ArrowLeftRight className="w-5 h-5 text-sky" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {trade.proposerAccessory.name} for {trade.recipientAccessory.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              From {trade.proposer.displayName || trade.proposer.username}
                            </p>
                            {trade.proposerNote && (
                              <p className="text-sm italic mt-1">"{trade.proposerNote}"</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptTradeMutation.mutate(trade.id)}
                            disabled={acceptTradeMutation.isPending}
                            data-testid={`button-accept-trade-${trade.id}`}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => declineTradeMutation.mutate(trade.id)}
                            disabled={declineTradeMutation.isPending}
                            data-testid={`button-decline-trade-${trade.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Send Gift
            </DialogTitle>
            <DialogDescription>
              Gift {selectedAccessory?.accessory.name} to another user
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Username</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="recipient"
                  placeholder="Search for a user..."
                  value={recipientUsername}
                  onChange={(e) => {
                    setRecipientUsername(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="pl-10"
                  data-testid="input-recipient"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="border rounded-md mt-1 max-h-32 overflow-y-auto">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      className="w-full px-3 py-2 text-left hover-elevate"
                      onClick={() => {
                        setRecipientUsername(u.username || "");
                        setSearchResults([]);
                      }}
                      data-testid={`button-select-user-${u.id}`}
                    >
                      {u.displayName || u.username}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a message..."
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                data-testid="input-gift-message"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setGiftDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendGift}
              disabled={!recipientUsername || giftMutation.isPending}
              data-testid="button-send-gift"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Gift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
