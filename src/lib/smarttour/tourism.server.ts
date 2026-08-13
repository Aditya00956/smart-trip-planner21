import type { z } from "zod";

import { INTERESTS } from "./constants";
import { currentWeather, searchNearby } from "./maps.server";
import { logApiEvents } from "./monitor.server";
import { buildPlan, buildRecommendations, resolveDestination } from "./pipeline.server";
import type { destinationQuerySchema, nearbySchema, planSchema, recommendSchema } from "./schemas";
import type { UserPreferences } from "./types";

export async function searchDestinationHandler(data: z.infer<typeof destinationQuerySchema>) {
  const geo = await resolveDestination(data.query);
  if (!geo.ok || !geo.data) {
    return { ok: false as const, error: geo.message, destination: null, weather: null };
  }
  const weather = await currentWeather(geo.data.location);
  await logApiEvents([
    {
      api: "weather",
      ok: weather.ok,
      status: weather.status,
      latencyMs: weather.latencyMs,
      message: weather.message,
    },
  ]);
  return {
    ok: true as const,
    error: null,
    destination: geo.data,
    weather: weather.data,
  };
}

export async function recommendHandler(data: z.infer<typeof recommendSchema>) {
  const { result, error } = await buildRecommendations({
    destination: data.destination,
    origin: data.origin ?? null,
    preferences: data.preferences as UserPreferences,
  });
  return { ok: Boolean(result), error, result };
}

export async function planHandler(data: z.infer<typeof planSchema>) {
  const { result, error } = await buildPlan({
    destination: data.destination,
    origin: data.origin ?? null,
    preferences: data.preferences as UserPreferences,
    startDate: data.startDate ?? null,
    includeAccommodation: data.includeAccommodation,
  });
  return { ok: Boolean(result), error, result };
}

const CATEGORY_TYPES: Record<string, string[]> = {
  restaurant: ["restaurant", "cafe"],
  hotel: ["hotel", "lodging", "resort_hotel"],
  attraction: ["tourist_attraction", "historical_landmark", "cultural_landmark"],
  museum: ["museum", "art_gallery"],
  park: ["park", "garden", "national_park"],
};

export async function nearbyHandler(data: z.infer<typeof nearbySchema>) {
  const types = CATEGORY_TYPES[data.category] ?? ["tourist_attraction"];
  const call = await searchNearby(data.location, types, data.radiusKm * 1000, 20);
  await logApiEvents([
    {
      api: `places:${data.category}`,
      ok: call.ok,
      status: call.status,
      latencyMs: call.latencyMs,
      message: call.message,
    },
  ]);
  if (!call.ok) {
    return {
      ok: false as const,
      error: call.message || "Nearby places are unavailable right now.",
      places: [],
    };
  }
  const known = new Set(INTERESTS.map((i) => i.id));
  const places = (call.data ?? []).map((place) => ({
    ...place,
    interests: place.interests.filter((i) => known.has(i)),
  }));
  return { ok: true as const, error: null, places };
}
