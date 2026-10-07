"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  clearStoredOpenAIKey,
  getStoredOpenAIKey,
  setStoredOpenAIKey,
} from "@/lib/openai-key-storage";

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Mounted only while the dialog is open, so state starts fresh each time. */
function OpenAIKeyForm({ onDone }: { onDone: () => void }) {
  const [draft, setDraft] = useState("");
  const [hasKey, setHasKey] = useState(() => Boolean(getStoredOpenAIKey()));

  const handleSave = () => {
    const key = draft.trim();
    if (!key) return;
    setStoredOpenAIKey(key);
    onDone();
  };

  const handleRemove = () => {
    clearStoredOpenAIKey();
    setHasKey(false);
    setDraft("");
  };

  return (
    <form
      className="grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        handleSave();
      }}
    >
      <label htmlFor="openai-key" className="text-sm font-medium">
        OpenAI key
      </label>
      <Input
        id="openai-key"
        type="password"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={hasKey ? "Key saved in this browser" : "sk-..."}
        autoComplete="off"
        spellCheck={false}
      />

      <DialogFooter className="mt-4">
        {hasKey && (
          <Button type="button" variant="outline" onClick={handleRemove}>
            Remove key
          </Button>
        )}
        <Button type="submit" disabled={!draft.trim()}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UserSettingsDialog({
  open,
  onOpenChange,
}: UserSettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your account preferences.</DialogDescription>
        </DialogHeader>
        <OpenAIKeyForm onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
