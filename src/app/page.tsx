"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="w-full h-dvh flex flex-col justify-center items-center gap-4">
      <h1 className="text-2xl font-bold">Chiama Agent</h1>

      {status === "loading" ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : session?.user ? (
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Signed in</p>
            <p className="font-mono text-sm bg-muted px-2.5 py-1 rounded-md mt-1">
              User ID: {session.user.id ?? "N/A"}
            </p>
            {session.user.email && (
              <p className="text-xs text-muted-foreground mt-1">
                {session.user.email}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Log out
          </Button>
        </div>
      ) : (
        <div>
          <Button onClick={() => signIn("google")}>Sign in with Google</Button>
        </div>
      )}
    </div>
  );
}
