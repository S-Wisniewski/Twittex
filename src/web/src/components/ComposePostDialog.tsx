import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft("");
    }
    setOpen(nextOpen);
  };

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

  const title = replyingTo
    ? t("compose.replyTo", { name: replyingTo })
    : t("compose.newPost");
  const placeholder = replyingTo
    ? t("compose.replyingTo", { name: replyingTo })
    : t("compose.whatsHappening");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            <DialogClose render={<Button variant="outline">{t("common.cancel")}</Button>} />
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {replyingTo ? t("common.reply") : t("common.post")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComposePostDialog;
