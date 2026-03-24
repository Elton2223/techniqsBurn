"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SecretViewError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/25">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">
            Something went wrong
          </h2>
          <p className="text-sm text-zinc-400">
            An unexpected error occurred while loading this secret. The link may
            be invalid or the secret may have already been destroyed.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={reset} variant="secondary" className="w-full">
            Try again
          </Button>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            className="w-full"
          >
            Go to homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
