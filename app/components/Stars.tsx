import { Star } from "lucide-react";
import { cn } from "../lib/utils";

export function Stars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25;
        const half = !filled && value >= i - 0.75;
        return (
          <Star
            key={i}
            size={size}
            className={cn(
              "transition-colors",
              filled || half ? "text-gold fill-current" : "text-muted-foreground/40",
            )}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}
