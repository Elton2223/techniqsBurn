"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  variant?: "success" | "error";
  onDismiss?: () => void;
  duration?: number;
}

export function Toast({
  message,
  visible,
  variant = "success",
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => setShow(true));
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onDismiss?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const Icon = variant === "success" ? Check : X;
  const colorClasses =
    variant === "success"
      ? "border-green-500/30 bg-green-500/10 text-green-400"
      : "border-red-500/30 bg-red-500/10 text-red-400";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div
        className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-sm transition-all duration-300 ${colorClasses} ${
          show
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0"
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {message}
      </div>
    </div>
  );
}
