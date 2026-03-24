import { Flame, Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-800/50">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Techniqs <span className="text-orange-500">Burn</span>
            </span>
          </a>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-zinc-700">
            <Ghost className="h-7 w-7 text-zinc-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-zinc-100">404</h1>
            <p className="text-sm text-zinc-400">
              This page doesn&apos;t exist. It may have already self-destructed.
            </p>
          </div>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            Go to homepage
          </a>
        </div>
      </main>
    </div>
  );
}
