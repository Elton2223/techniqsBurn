"use client";

import { Flame } from "lucide-react";

export function BurnAnimation() {
  return (
    <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
      <div className="absolute inset-0 animate-ping rounded-full bg-orange-500/20" />
      <div className="absolute inset-2 animate-pulse rounded-full bg-orange-500/10" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 ring-1 ring-orange-500/25">
        <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
      </div>
    </div>
  );
}
