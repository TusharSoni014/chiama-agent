"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  HelpCircleIcon,
  Login01Icon,
  Logout01Icon,
  Settings02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentStore } from "@/stores/agent-store";

export function ChatSidebarUser() {
  const { data: session, status } = useSession();
  const setHelpOpen = useAgentStore((state) => state.setHelpOpen);
  const setSettingsOpen = useAgentStore((state) => state.setSettingsOpen);
  const signedIn = Boolean(session?.user);

  if (status === "loading") {
    return <Skeleton className="h-12 w-full" />;
  }

  return (
    <>
      {!signedIn ? (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="min-w-0 flex-1"
            onClick={() => signIn("google")}
          >
            <HugeiconsIcon icon={Login01Icon} data-icon="inline-start" />
            Sign in with Google
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Help"
            onClick={() => setHelpOpen(true)}
          >
            <HugeiconsIcon icon={HelpCircleIcon} />
          </Button>
        </div>
      ) : (
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
                <Avatar>
                  <AvatarImage
                    src={session?.user?.image ?? undefined}
                    alt={session?.user?.name ?? "User"}
                  />
                  <AvatarFallback>
                    {session?.user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">
                    {session?.user?.name ?? "User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {session?.user?.email ?? session?.user?.id}
                  </span>
                </div>
                <HugeiconsIcon
                  icon={UnfoldMoreIcon}
                  className="ml-auto size-4 shrink-0 text-muted-foreground"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setHelpOpen(true)}>
                    <HugeiconsIcon icon={HelpCircleIcon} />
                    Help
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <HugeiconsIcon icon={Settings02Icon} />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <HugeiconsIcon icon={Logout01Icon} />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      )}
    </>
  );
}
