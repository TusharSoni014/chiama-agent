"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
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
import { UserSettingsDialog } from "./user-settings-dialog";

export function ChatSidebarUser() {
  const { data: session, status } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (status === "loading") {
    return <Skeleton className="h-12 w-full" />;
  }

  if (!session?.user) {
    return (
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("google")}
      >
        <HugeiconsIcon icon={Login01Icon} data-icon="inline-start" />
        Sign in with Google
      </Button>
    );
  }

  const { name, email, image, id } = session.user;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
            <Avatar>
              <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
              <AvatarFallback>{name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate text-sm font-medium">
                {name ?? "User"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {email ?? id}
              </span>
            </div>
            <HugeiconsIcon
              icon={UnfoldMoreIcon}
              className="ml-auto size-4 shrink-0 text-muted-foreground"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start">
            <DropdownMenuGroup>
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
      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </SidebarMenu>
  );
}
