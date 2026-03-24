"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    const order = ["dark", "light", "system"] as const;
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  return (
    <button
      onClick={cycle}
      className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 cursor-pointer"
      aria-label={`Theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
    >
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "system" && <Monitor className="h-4 w-4" />}
    </button>
  );
}
