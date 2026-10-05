import type { ComponentProps } from "react";

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return (
    <select
      className={`rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
      {...props}
    />
  );
}
