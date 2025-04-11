import * as React from "react";
import * as Progress from "@radix-ui/react-progress";
import { cn } from "@/client/utils";

export interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className }) => {
  return (
    <Progress.Root
      value={progress}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      <Progress.Indicator
        className="h-full w-full origin-left bg-primary transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - progress}%)` }}
      />
    </Progress.Root>
  );
};

ProgressBar.displayName = "ProgressBar";
