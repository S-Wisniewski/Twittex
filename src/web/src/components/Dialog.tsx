import type { ReactElement, ReactNode } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
export const SmallDialog = ({
  triggerButton,
  title,
  description,
  body,
  secondButton,
}: {
  triggerButton: ReactElement;
  title?: ReactNode;
  description?: ReactNode;
  body?: ReactNode;
  secondButton?: ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger render={triggerButton} />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          {title ? (
            <DialogTitle className={"text-center"}>{title}</DialogTitle>
          ) : null}
          {description ? (
            <DialogDescription className={"text-center"}>
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {body ? (
          <div className="flex flex-col items-center gap-4">{body}</div>
        ) : null}
        <DialogFooter className="flex items-center justify-center! gap-4">
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          {secondButton}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
