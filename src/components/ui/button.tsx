import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-orange-600 text-white hover:bg-orange-500 active:bg-orange-700":
              variant === "default",
            "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-800":
              variant === "secondary",
            "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-500 active:bg-red-700":
              variant === "destructive",
          },
          {
            "h-11 px-6 text-sm": size === "default",
            "h-9 px-4 text-xs": size === "sm",
            "h-12 px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
