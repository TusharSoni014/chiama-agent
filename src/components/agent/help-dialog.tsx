"use client";

import type { ReactNode } from "react";
import { signIn } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Bookmark02Icon,
  Call02Icon,
  FlashIcon,
  Login01Icon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signedIn: boolean;
}

function Tip({
  icon,
  title,
  children,
}: {
  icon: typeof Login01Icon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-2xl bg-muted/50 p-3 ring-1 ring-foreground/5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-foreground ring-1 ring-foreground/10 [&_svg]:size-4">
        <HugeiconsIcon icon={icon} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading font-medium">{title}</p>
        <div className="mt-0.5 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export function HelpDialog({ open, onOpenChange, signedIn }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Make Chiama yours</DialogTitle>
          <DialogDescription>
            A few shortcuts so chat, calls, and history stay out of the way.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {!signedIn && (
            <div className="flex gap-3 rounded-2xl bg-primary p-3 text-primary-foreground ring-1 ring-primary">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 [&_svg]:size-4">
                <HugeiconsIcon icon={Login01Icon} />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div>
                  <p className="font-heading font-medium">
                    Sign in for a better experience
                  </p>
                  <p className="mt-0.5 text-sm text-primary-foreground/80">
                    Keep threads, memory, and your place across devices.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-fit"
                  onClick={() => signIn("google")}
                >
                  <HugeiconsIcon icon={Login01Icon} data-icon="inline-start" />
                  Sign in with Google
                </Button>
              </div>
            </div>
          )}
          <Tip icon={Bookmark02Icon} title="Save your chats">
            Signed-in conversations stay in the sidebar so you can pick them up
            later.
          </Tip>
          <Tip icon={FlashIcon} title="Faster memory">
            Saved threads load quicker, and the agent can remember what you
            already covered.
          </Tip>
          <Tip icon={Call02Icon} title="Calls and your OpenAI key">
            {signedIn
              ? "If a call doesn't start, open the account menu at the bottom of the sidebar, choose Settings, and add your OpenAI key."
              : "If a call doesn't start, sign in, then open the account menu at the bottom of the sidebar, choose Settings, and add your OpenAI key."}
          </Tip>
          <Tip icon={SearchIcon} title="Search chats">
            <div className="flex flex-wrap items-center gap-2">
              <span>Jump to any conversation from the command palette.</span>
              <span className="flex items-center gap-1">
                <Badge variant="outline">Ctrl</Badge>
                <Badge variant="outline">K</Badge>
                <span className="text-xs">or</span>
                <Badge variant="outline">⌘</Badge>
                <Badge variant="outline">K</Badge>
              </span>
            </div>
          </Tip>
        </div>
      </DialogContent>
    </Dialog>
  );
}
