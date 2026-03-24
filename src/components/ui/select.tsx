import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes, forwardRef } from "react";

const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-lg border border-zinc-700/50 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 appearance-none cursor-pointer",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";

export { Select };
