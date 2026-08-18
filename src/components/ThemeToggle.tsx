import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="tablist"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border p-1 shadow-sm",
        "bg-glass backdrop-blur-sm",
        className,
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={theme === "light"}
        aria-controls="theme"
        onClick={() => setTheme("light")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
          theme === "light"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Sun aria-hidden className="size-4" />
        Light
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={theme === "dark"}
        aria-controls="theme"
        onClick={() => setTheme("dark")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
          theme === "dark"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Moon aria-hidden className="size-4" />
        Dark
      </button>
    </div>
  );
}
