import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type RenameDialogProps = {
  currentName: string;
};

export function RenameDialog({ currentName }: RenameDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const { toast } = useToast();

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const renameMutation = useMutation({
    mutationFn: (newName: string) =>
      apiRequest("PATCH", "/api/creature/rename", { name: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creature"] });
      setOpen(false);
      toast({
        title: "Name updated!",
        description: `Your buddy is now called ${name}`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to rename",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0 && name.length <= 20) {
      renameMutation.mutate(name.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          data-testid="button-rename"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-display">Name Your Buddy</DialogTitle>
            <DialogDescription>
              Give your learning companion a special name!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Enter a name..."
              className="mt-2"
              data-testid="input-creature-name"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {name.length}/20 characters
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={renameMutation.isPending || name.trim().length === 0}
              data-testid="button-save-name"
            >
              {renameMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
