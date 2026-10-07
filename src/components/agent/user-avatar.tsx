"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** Signed-in profile photo, or a "U" placeholder when there is no picture. */
export function UserAvatar({ className }: { className?: string }) {
  const { data: session, status } = useSession();
  const image = status === "authenticated" ? session?.user?.image : null;

  return (
    <Avatar className={className}>
      {image ? (
        <AvatarImage
          src={image}
          alt={session?.user?.name ?? "You"}
          referrerPolicy="no-referrer"
        />
      ) : null}
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  );
}
