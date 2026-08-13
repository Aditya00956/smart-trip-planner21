import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  strong?: boolean;
  interactive?: boolean;
}

export function GlassPanel({
  as: Tag = "div",
  strong = false,
  interactive = false,
  className,
  ...props
}: GlassPanelProps) {
  return (
    <Tag
      className={cn(
        strong ? "glass-strong" : "glass",
        interactive && "glass-hover",
        "rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}
