import { GlassPanel } from "./GlassPanel";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatTime } from "@/lib/smarttour/recommendation";
import type { ItineraryDay } from "@/lib/smarttour/types";

export function ItineraryTimeline({
  itinerary,
  onSelectStop,
}: {
  itinerary: ItineraryDay[];
  onSelectStop?: (placeId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {itinerary.map((day) => (
        <GlassPanel key={day.day} as="section" className="p-5" aria-label={`Day ${day.day} plan`}>
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">
                Day {day.day}
                {day.date ? <span className="text-muted-foreground"> · {day.date}</span> : null}
              </h3>
              <p className="text-xs text-muted-foreground">
                {day.totalDistanceKm} km travel · {formatINR(day.totalCost)} estimated
              </p>
            </div>
            {day.weather ? (
              <Badge variant={day.weather.outdoorFriendly ? "secondary" : "outline"}>
                {day.weather.condition}
                {day.weather.maxTempC !== null ? ` · ${Math.round(day.weather.maxTempC)}°C` : ""}
              </Badge>
            ) : null}
          </header>

          <ol className="mt-4 space-y-3">
            {day.stops.map((stop, index) => (
              <li key={`${stop.placeId}-${index}`} className="flex gap-3">
                <div className="w-20 shrink-0 text-sm font-semibold text-primary">
                  {formatTime(stop.time)}
                </div>
                <div className="flex-1 border-l border-border pl-4 pb-1">
                  <button
                    type="button"
                    className="text-left font-medium hover:text-primary"
                    onClick={() => onSelectStop?.(stop.placeId)}
                  >
                    {stop.name}
                  </button>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {stop.kind === "meal" ? "Meal" : stop.category} · {stop.durationMin} min ·{" "}
                    {formatINR(stop.estimatedCost)}
                  </p>
                  {stop.travelFromPreviousKm > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stop.travelFromPreviousKm} km · {stop.travelFromPreviousMin} min travel
                    </p>
                  ) : null}
                  {stop.note ? (
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{stop.note}</p>
                  ) : null}
                </div>
              </li>
            ))}
            {day.stops.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No stops matched this day. Widen your interests or distance limit.
              </li>
            ) : null}
          </ol>
        </GlassPanel>
      ))}
    </div>
  );
}
