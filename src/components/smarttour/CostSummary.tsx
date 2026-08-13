import { GlassPanel } from "./GlassPanel";
import { Progress } from "@/components/ui/progress";
import { formatINR } from "@/lib/smarttour/recommendation";
import type { CostBreakdown } from "@/lib/smarttour/types";

const ROWS: { key: keyof CostBreakdown; label: string }[] = [
  { key: "transport", label: "Transportation" },
  { key: "food", label: "Food" },
  { key: "entryFees", label: "Entry fees" },
  { key: "accommodation", label: "Accommodation" },
  { key: "other", label: "Other expenses" },
];

export function CostSummary({ cost }: { cost: CostBreakdown }) {
  const used = cost.budget > 0 ? Math.min(100, (cost.total / cost.budget) * 100) : 100;
  const over = cost.remaining < 0;

  return (
    <GlassPanel className="p-5" aria-label="Estimated trip cost">
      <h3 className="text-sm font-semibold">Estimated trip cost</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        All figures are estimates based on price levels, distance and typical local costs.
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        {ROWS.filter((row) => Number(cost[row.key]) > 0).map((row) => (
          <div key={row.key} className="flex items-center justify-between">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium">{formatINR(Number(cost[row.key]))}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border pt-2 text-base">
          <dt className="font-semibold">Total estimated</dt>
          <dd className="font-semibold text-primary">{formatINR(cost.total)}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <Progress value={used} aria-label="Budget used" />
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Budget {formatINR(cost.budget)}</span>
          <span className={over ? "font-semibold text-destructive" : "font-semibold text-success"}>
            {over ? `Over by ${formatINR(Math.abs(cost.remaining))}` : `${formatINR(cost.remaining)} left`}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Approx. {formatINR(cost.perDay)} per day.
        </p>
      </div>
    </GlassPanel>
  );
}
