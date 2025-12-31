import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        variant === "default" &&
          "bg-primary/10 text-primary ring-primary/20",
        variant === "secondary" &&
          "bg-muted text-foreground ring-border",
        variant === "success" &&
          "bg-green-100 text-green-700 ring-green-200",
        variant === "destructive" &&
          "bg-red-100 text-red-700 ring-red-200",
        className
      )}
      {...props}
    />
  );
}
