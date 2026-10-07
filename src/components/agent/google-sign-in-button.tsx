"use client";

import { useState, type ComponentProps } from "react";
import { signIn } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Login01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function GoogleSignInButton({
  ...props
}: ComponentProps<typeof Button>) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      onClick={() => {
        setPending(true);
        void signIn("google");
      }}
    >
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <HugeiconsIcon icon={Login01Icon} data-icon="inline-start" />
      )}
      Sign in with Google
    </Button>
  );
}
