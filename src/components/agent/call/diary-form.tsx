"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  getStoredOpenAIKey,
  OPENAI_KEY_HEADER,
} from "@/lib/openai-key-storage";
import type { VoiceRole } from "@/lib/voice-protocol";
import { ChatErrorAlert } from "../chat-error-alert";

interface DiaryFormProps {
  transcript: { role: VoiceRole; text: string }[];
}

interface DiaryValues {
  personName: string;
  duration: string;
  topics: string;
}

const EMPTY_VALUES: DiaryValues = { personName: "", duration: "", topics: "" };

async function extractDiaryValues(
  transcript: DiaryFormProps["transcript"],
  signal: AbortSignal,
): Promise<DiaryValues> {
  const key = getStoredOpenAIKey();
  const res = await fetch("/api/diary/extract", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(key ? { [OPENAI_KEY_HEADER]: key } : {}),
    },
    body: JSON.stringify({
      transcript: transcript.map(({ role, text }) => ({ role, text })),
    }),
  });
  if (!res.ok) throw new Error((await res.text()) || res.statusText);
  return res.json();
}

/**
 * The meetup log for a finished diary call. It starts filled in by the AI from
 * the call's transcript, and every field stays editable. Mount it after the
 * call ends; a new call unmounts it.
 */
export function DiaryForm({ transcript }: DiaryFormProps) {
  const [values, setValues] = useState<DiaryValues>(EMPTY_VALUES);
  const [isFilling, setIsFilling] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Bumped by "Fill again" to run the extraction once more.
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // The call just ended: bring the form into view so the loading is seen.
  useEffect(() => {
    formRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setIsFilling(true);
    setError(null);

    extractDiaryValues(transcript, controller.signal)
      .then((filled) => {
        setValues(filled);
        setIsFilling(false);
      })
      .catch((caught) => {
        if (controller.signal.aborted) return;
        setError(caught instanceof Error ? caught : new Error(String(caught)));
        setIsFilling(false);
      });

    return () => controller.abort();
  }, [transcript, attempt]);

  const setField = useCallback(
    (field: keyof DiaryValues) =>
      (
        event:
          | React.ChangeEvent<HTMLInputElement>
          | React.ChangeEvent<HTMLTextAreaElement>,
      ) =>
        setValues((current) => ({ ...current, [field]: event.target.value })),
    [],
  );

  return (
    <form
      ref={formRef}
      className="mx-auto flex w-full max-w-2xl flex-col gap-3"
      onSubmit={(event) => event.preventDefault()}
      aria-busy={isFilling}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">Meetup log</h3>
        {!isFilling && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setAttempt((count) => count + 1)}
          >
            Fill again from call
          </Button>
        )}
      </div>

      {error && (
        <ChatErrorAlert
          title="Could not fill the form"
          error={error}
          onRetry={() => setAttempt((count) => count + 1)}
        />
      )}

      {isFilling ? (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4"
        >
          <p className="flex items-center gap-2 text-sm font-medium">
            <Spinner /> Reading your call and writing up the log...
          </p>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            <span>
              Who did you meet <span aria-hidden="true">*</span>
            </span>
            <Input
              value={values.personName}
              onChange={setField("personName")}
              required
              aria-invalid={!isFilling && !values.personName.trim()}
              placeholder="Name of the person"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            How long did you chat
            <Input
              value={values.duration}
              onChange={setField("duration")}
              placeholder="e.g. 20 minutes"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            What did you talk about
            <Textarea
              value={values.topics}
              onChange={setField("topics")}
              placeholder="Topics you covered"
            />
          </label>
        </>
      )}
    </form>
  );
}
