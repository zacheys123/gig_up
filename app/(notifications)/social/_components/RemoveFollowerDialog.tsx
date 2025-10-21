// components/followers/RemoveFollowerDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface Follower {
  firstname?: string;
  lastname?: string;
}

interface RemoveFollowerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  follower: Follower | null;
  onRemove: () => void;
  colors: any;
}

export default function RemoveFollowerDialog({
  open,
  onOpenChange,
  follower,
  onRemove,
  colors,
}: RemoveFollowerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "rounded-xl md:rounded-2xl max-w-[95vw] md:max-w-md",
          colors.card
        )}
      >
        <DialogHeader>
          <DialogTitle className={cn(colors.text)}>Remove Follower</DialogTitle>
          <DialogDescription className={cn(colors.textMuted)}>
            Are you sure you want to remove {follower?.firstname} from your
            followers? They won't be notified, but they won't be able to see
            your private content anymore.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={cn("rounded-xl border-2 flex-1", colors.border)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onRemove}
            className="rounded-xl flex-1"
          >
            <UserX className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
