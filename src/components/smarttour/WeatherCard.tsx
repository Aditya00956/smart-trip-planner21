import { CloudRain, Droplets, Sun, Wind } from "lucide-react";

import { GlassPanel } from "./GlassPanel";
import type { WeatherForecastDay, WeatherSnapshot } from "@/lib/smarttour/types";

export function WeatherCard({
  weather,
  forecast,
  place,
}: {
  weather: WeatherSnapshot;
  forecast: WeatherForecastDay[];
  place: string;
}) {
  if (!weather.available) {
    return (
      <GlassPanel className="p-5">
        <h3 className="text-sm font-semibold">Weather</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn&apos;t retrieve weather information right now. Your recommendations are still
          available using interest, distance, rating, budget and popularity.
        </p>
      </GlassPanel>
    );
  }

  const Icon = weather.outdoorFriendly ? Sun : CloudRain;

  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Weather in {place}</h3>
          <p className="mt-1 text-3xl font-semibold">
            {weather.temperatureC !== null ? `${Math.round(weather.temperatureC)}°C` : "—"}
          </p>
          <p className="text-sm text-muted-foreground">{weather.condition}</p>
        </div>
        <Icon aria-hidden className="size-10 text-primary" />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="flex items-center gap-1 text-[11px] uppercase text-muted-foreground">
            <Droplets aria-hidden className="size-3" /> Humidity
          </dt>
          <dd className="font-medium">{weather.humidity !== null ? `${weather.humidity}%` : "—"}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[11px] uppercase text-muted-foreground">
            <Wind aria-hidden className="size-3" /> Wind
          </dt>
          <dd className="font-medium">
            {weather.windKph !== null ? `${Math.round(weather.windKph)} km/h` : "—"}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[11px] uppercase text-muted-foreground">
            <CloudRain aria-hidden className="size-3" /> Rain
          </dt>
          <dd className="font-medium">
            {weather.precipitationPercent !== null ? `${weather.precipitationPercent}%` : "—"}
          </dd>
        </div>
      </dl>

      {forecast.length > 0 ? (
        <ul className="mt-4 flex gap-2 overflow-x-auto scroll-thin pb-1">
          {forecast.map((day) => (
            <li key={day.date} className="min-w-24 rounded-xl border border-border p-2 text-center">
              <p className="text-[11px] text-muted-foreground">{day.date.slice(5)}</p>
              <p className="text-sm font-semibold">
                {day.maxTempC !== null ? `${Math.round(day.maxTempC)}°` : "—"}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {day.outdoorFriendly ? "Outdoor ok" : "Indoor day"}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </GlassPanel>
  );
}
