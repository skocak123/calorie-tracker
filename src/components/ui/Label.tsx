import type { ComponentProps } from "react";

export function Label({ className = "", ...props }: ComponentProps<"label">) {
  return <label className={`text-sm font-medium ${className}`} {...props} />;
}
