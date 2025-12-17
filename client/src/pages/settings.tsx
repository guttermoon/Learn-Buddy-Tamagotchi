import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

type Settings = {
  notificationTime: string;
  showOnLeaderboard: boolean;
};

const timeOptions = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "21:00", label: "9:00 PM" },
];

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/user/settings"],
  });

  const [notificationTime, setNotificationTime] = useState<string | undefined>();
  const [showOnLeaderboard, setShowOnLeaderboard] = useState<boolean | undefined>();

  const mutation = useMutation({
    mutationFn: (data: Partial<Settings>) =>
      apiRequest("POST", "/api/user/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    },
  });

  const handleNotificationTimeChange = (value: string) => {
    setNotificationTime(value);
    mutation.mutate({ notificationTime: value });
  };

  const handleLeaderboardToggle = (checked: boolean) => {
    setShowOnLeaderboard(checked);
    mutation.mutate({ showOnLeaderboard: checked });
  };

  const currentNotificationTime = notificationTime ?? settings?.notificationTime ?? "09:00";
  const currentShowOnLeaderboard = showOnLeaderboard ?? settings?.showOnLeaderboard ?? true;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/profile")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-2xl">Settings</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-lavender" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="notification-time" className="font-medium">
                      Daily Fact Reminder
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When should we remind you to learn?
                    </p>
                  </div>
                </div>
                <Select
                  value={currentNotificationTime}
                  onValueChange={handleNotificationTimeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger 
                    className="w-32"
                    id="notification-time"
                    data-testid="select-notification-time"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-mint" />
              Privacy
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="show-leaderboard" className="font-medium">
                    Show on Leaderboard
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your ranking
                  </p>
                </div>
                <Switch
                  id="show-leaderboard"
                  checked={currentShowOnLeaderboard}
                  onCheckedChange={handleLeaderboardToggle}
                  disabled={isLoading}
                  data-testid="switch-show-leaderboard"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Learn Buddy v1.0</p>
            <p className="text-xs text-muted-foreground">
              Made with care for retail champions
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
