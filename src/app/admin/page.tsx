"use client";

import { useState, useEffect } from "react";
import { Flame, BarChart3, Eye, Clock, Activity, Loader2 } from "lucide-react";

interface Stats {
  created: number;
  viewed: number;
  expired: number;
  active: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error();
        setStats(await res.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = stats
    ? [
        {
          label: "Secrets Created",
          value: stats.created,
          icon: Flame,
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          ring: "ring-orange-500/25",
        },
        {
          label: "Secrets Viewed",
          value: stats.viewed,
          icon: Eye,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          ring: "ring-blue-500/25",
        },
        {
          label: "Secrets Expired",
          value: stats.expired,
          icon: Clock,
          color: "text-zinc-400",
          bg: "bg-zinc-500/10",
          ring: "ring-zinc-500/25",
        },
        {
          label: "Active Secrets",
          value: stats.active,
          icon: Activity,
          color: "text-green-500",
          bg: "bg-green-500/10",
          ring: "ring-green-500/25",
        },
      ]
    : [];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-800/50">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Techniqs <span className="text-orange-500">Burn</span>
            </span>
          </a>
          <div className="flex items-center gap-2 text-zinc-400">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-4xl space-y-10">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-zinc-400">
              Anonymous usage stats for Techniqs Burn.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              Failed to load stats. Make sure the database is running.
            </div>
          )}

          {stats && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        {card.label}
                      </span>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${card.bg} ring-1 ${card.ring}`}
                      >
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold ${card.color}`}>
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {stats.created > 0 && (
                <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-6 space-y-4">
                  <h2 className="text-sm font-medium text-zinc-300">
                    Burn Rate
                  </h2>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Viewed</span>
                        <span>
                          {Math.round((stats.viewed / stats.created) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                          style={{
                            width: `${Math.min((stats.viewed / stats.created) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Expired without viewing</span>
                        <span>
                          {Math.round((stats.expired / stats.created) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-zinc-500 transition-all duration-500"
                          style={{
                            width: `${Math.min((stats.expired / stats.created) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-800/50">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} Official Techniqs. All rights
            reserved.
          </p>
          <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Back to home
          </a>
        </div>
      </footer>
    </div>
  );
}
