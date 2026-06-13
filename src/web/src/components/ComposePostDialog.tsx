import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/UserAvatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MAX_LENGTH = 2000;

type ComposePostDialogProps = {
  trigger: React.ReactElement;
  userName: string;
  userAvatarUrl: string;
  onSubmit: (content: string) => void;
  replyingTo?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const ComposePostDialog = ({
  trigger,
  userName,
  userAvatarUrl,
  onSubmit,
  replyingTo,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ComposePostDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  // Reset draft each time the dialog transitions from closed → open
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setDraft("");
    }
    prevOpenRef.current = open;
  }, [open]);

  const setOpen = (value: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  const remaining = MAX_LENGTH - draft.length;
  const canSubmit = draft.trim().length > 0 && draft.length <= MAX_LENGTH;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(draft.trim());
    setOpen(false);
  };

  const title = replyingTo ? `Reply to ${replyingTo}` : "New post";
  const placeholder = replyingTo
    ? `Replying to @${replyingTo}…`
    : "What's happening?";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent showCloseButton={false} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-start">
          <UserAvatar url={userAvatarUrl} name={userName} />
          <Textarea
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_LENGTH}
            className="flex-1 min-h-28"
            autoFocus
          />
        </div>

        <DialogFooter className="flex items-center justify-between! gap-4">
          <span
            className={
              remaining < 100
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
          >
            {remaining}
          </span>
          <div className="flex gap-2">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {replyingTo ? "Reply" : "Post"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComposePostDialog;
