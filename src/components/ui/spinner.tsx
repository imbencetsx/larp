import { Loader as Loader2Icon } from "pixelarticons/react/Loader.js";
import type React from "react";
import { cn } from "~/lib/utils";

export function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof Loader2Icon>): React.ReactElement {
  return (
    <Loader2Icon
      aria-label="Loading"
      className={cn("animate-spin", className)}
      role="status"
      {...props}
    />
  );
}
