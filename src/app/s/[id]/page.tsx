import type { Metadata } from "next";
import { Flame, Lock } from "lucide-react";
import { ViewSecret } from "@/components/view-secret";

export const metadata: Metadata = {
  title: "Someone sent you a secret — Techniqs Burn",
  description:
    "Open this link to reveal a self-destructing encrypted secret. Once viewed, it will be permanently destroyed. Powered by Techniqs Burn.",
  openGraph: {
    title: "Someone sent you a secret",
    description:
      "Open this link to reveal a self-destructing encrypted secret. Once viewed, it will be permanently destroyed.",
    siteName: "Techniqs Burn",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Someone sent you a secret",
    description:
      "Open this link to reveal a self-destructing encrypted secret. Once viewed, it will be permanently destroyed.",
  },
};

export default async function ViewSecretPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.04)_0%,_transparent_70%)]" />

      <div className="relative z-10 flex w-full max-w-lg flex-col">
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/40 px-6 py-4">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                Techniqs <span className="text-orange-500">Burn</span>
              </span>
            </a>
            <div className="flex items-center gap-1.5 text-zinc-600">
              <Lock className="h-3 w-3" />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                Encrypted
              </span>
            </div>
          </div>

          <div className="px-6 py-8">
            <ViewSecret secretId={id} />
          </div>

          <div className="border-t border-zinc-800/40 px-6 py-3">
            <p className="text-center text-[10px] text-zinc-600">
              AES-256-GCM &middot; Client-side encryption &middot; Zero-knowledge
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-zinc-700">
          &copy; {new Date().getFullYear()} Official Techniqs. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
