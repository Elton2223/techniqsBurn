import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef } from "react";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border border-zinc-700/50 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
