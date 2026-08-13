/**
 * The SmartTour intelligence pipeline (server-only).
 *
 * Places + Weather + Routes are fetched in parallel, results are normalised and
 * fed into the recommendation engine, then into itinerary generation, route
 * optimisation and cost estimation. Any single API failure degrades gracefully.
 */
import { INTERESTS } from "./constants";
import {
  currentWeather,
  geocode,
  routeMatrix,
  searchNearby,
  weatherForecast,
  computeRoute,
  type ApiCall,
} from "./maps.server";
import { logApiEvents } from "./monitor.server";
import { buildItinerary, estimateTripCost, optimiseOrder, rankPlaces } from "./recommendation";
import type {
  ApiHealth,
  CostBreakdown,
  ItineraryDay,
  LatLng,
  Place,
  RecommendationResult,
  UserPreferences,
  WeatherSnapshot,
} from "./types";

const UNAVAILABLE_WEATHER: WeatherSnapshot = {
  temperatureC: null,
  condition: "Unavailable",
  humidity: null,
  windKph: null,
  precipitationPercent: null,
  outdoorFriendly: true,
  available: false,
};

function typesForInterests(interests: string[]): string[] {
  const chosen = INTERESTS.filter((i) => interests.includes(i.id));
  const source = chosen.length > 0 ? chosen : INTERESTS;
  const types = new Set<string>(["tourist_attraction"]);
  source.forEach((i) => i.placeTypes.forEach((t) => types.add(t)));
  return [...types].slice(0, 30);
}

function dedupe(places: Place[]): Place[] {
  const seen = new Map<string, Place>();
  places.forEach((p) => {
    if (!seen.has(p.placeId)) seen.set(p.placeId, p);
  });
  return [...seen.values()];
}

export async function resolveDestination(query: string) {
  const result = await geocode(query);
  await logApiEvents([
    {
      api: "geocode",
      ok: result.ok,
      status: result.status,
      latencyMs: result.latencyMs,
      message: result.message,
    },
  ]);
  return result;
}

export interface RecommendInput {
  destination: string;
  origin?: LatLng | null;
  preferences: UserPreferences;
  userId?: string | null;
}

export async function buildRecommendations(
  input: RecommendInput,
): Promise<{ result: RecommendationResult | null; error: string | null }> {
  const started = Date.now();
  const notes: string[] = [];

  const geo = await resolveDestination(input.destination);
  if (!geo.ok || !geo.data) {
    return { result: null, error: geo.message || "We couldn't locate that destination." };
  }
  const center = geo.data.location;
  const origin = input.origin ?? center;
  const radius = Math.max(2000, Math.min(50000, input.preferences.maxDistanceKm * 1000));

  const [attractionsCall, foodCall, weatherCall, forecastCall] = await Promise.all([
    searchNearby(center, typesForInterests(input.preferences.interests), radius),
    searchNearby(center, ["restaurant", "cafe"], radius, 12),
    currentWeather(center),
    weatherForecast(center, input.preferences.days),
  ]);

  const health: ApiHealth = {
    geocode: geo.ok,
    places: attractionsCall.ok,
    weather: weatherCall.ok,
    routes: true,
    notes,
  };

  if (!attractionsCall.ok) {
    await logCalls(input.userId, { places: attractionsCall, weather: weatherCall });
    return {
      result: null,
      error:
        attractionsCall.message ||
        "We couldn't load attractions for this destination right now. Please try again.",
    };
  }

  const attractions = attractionsCall.data ?? [];
  const eateries = foodCall.ok ? (foodCall.data ?? []) : [];
  if (!foodCall.ok) notes.push("Restaurant results are unavailable, so meals are estimated.");
  const places = dedupe([...attractions, ...eateries]);

  if (places.length === 0) {
    return {
      result: null,
      error: `No attractions matched your interests near ${geo.data.name}. Try widening your distance or interests.`,
    };
  }

  const weather = weatherCall.ok && weatherCall.data ? weatherCall.data : UNAVAILABLE_WEATHER;
  if (!weatherCall.ok) {
    notes.push(
      "Weather information is unavailable right now — recommendations use interest, distance, rating, budget and popularity.",
    );
  }

  const forecast = forecastCall.ok ? (forecastCall.data ?? []) : [];
  if (!forecastCall.ok) notes.push("Multi-day forecast unavailable; itinerary ignores weather.");

  // Real travel distance/time from the Routes API, with a geometric fallback.
  const matrixTargets = places.slice(0, 25);
  const matrix = await routeMatrix(
    origin,
    matrixTargets.map((p) => p.location),
    input.preferences.transport,
  );
  const routeMap = new Map<string, { distanceKm: number; durationMin: number }>();
  if (matrix.ok && matrix.data) {
    matrix.data.forEach((entry) => {
      const place = matrixTargets[entry.destinationIndex];
      if (place) routeMap.set(place.placeId, entry);
    });
  } else {
    health.routes = false;
    notes.push("Routing service unavailable — distances are straight-line estimates.");
  }

  const ranked = rankPlaces(places, origin, input.preferences, weather, routeMap);

  await logCalls(input.userId, {
    places: attractionsCall,
    food: foodCall,
    weather: weatherCall,
    forecast: forecastCall,
    routes: matrix,
  });

  return {
    result: {
      destination: {
        name: geo.data.name,
        location: center,
        formattedAddress: geo.data.formattedAddress,
      },
      weather,
      forecast,
      places: ranked,
      health,
      generatedInMs: Date.now() - started,
    },
    error: null,
  };
}

export interface PlanResult {
  recommendations: RecommendationResult;
  itinerary: ItineraryDay[];
  cost: CostBreakdown;
  routePolyline: string;
  routeDistanceKm: number;
  routeDurationMin: number;
}

export async function buildPlan(
  input: RecommendInput & { startDate?: string | null; includeAccommodation?: boolean },
): Promise<{ result: PlanResult | null; error: string | null }> {
  const { result, error } = await buildRecommendations(input);
  if (!result) return { result: null, error };

  const itinerary = buildItinerary({
    origin: input.origin ?? result.destination.location,
    ranked: result.places,
    preferences: input.preferences,
    forecast: result.forecast,
    startDate: input.startDate ?? null,
  });

  const cost = estimateTripCost(itinerary, input.preferences, {
    includeAccommodation: input.includeAccommodation ?? false,
  });

  // Visualise day 1 as an optimised route on the map.
  const firstDay = itinerary[0];
  let routePolyline = "";
  let routeDistanceKm = firstDay?.totalDistanceKm ?? 0;
  let routeDurationMin = 0;
  if (firstDay && firstDay.stops.length >= 1) {
    const ordered = optimiseOrder(
      input.origin ?? result.destination.location,
      firstDay.stops.map((s) => ({
        placeId: s.placeId,
        name: s.name,
        category: s.category,
        interests: [],
        description: "",
        rating: null,
        userRatingCount: 0,
        priceLevel: null,
        location: s.location,
        openNow: null,
        openingHours: [],
        address: "",
        indoor: false,
      })),
    );
    const route = await computeRoute(
      [input.origin ?? result.destination.location, ...ordered.map((p) => p.location)],
      input.preferences.transport,
    );
    if (route.ok && route.data) {
      routePolyline = route.data.polyline;
      routeDistanceKm = route.data.distanceKm;
      routeDurationMin = route.data.durationMin;
    } else {
      result.health.routes = false;
      result.health.notes.push("Route line unavailable — showing stop markers only.");
    }
    await logCalls(input.userId, { directions: route });
  }

  return {
    result: { recommendations: result, itinerary, cost, routePolyline, routeDistanceKm, routeDurationMin },
    error: null,
  };
}

async function logCalls(
  userId: string | null | undefined,
  calls: Record<string, ApiCall<unknown> | undefined>,
): Promise<void> {
  const events = Object.entries(calls)
    .filter((entry): entry is [string, ApiCall<unknown>] => Boolean(entry[1]))
    .map(([api, call]) => ({
      api,
      ok: call.ok,
      status: call.status,
      latencyMs: call.latencyMs,
      message: call.message,
      userId: userId ?? null,
    }));
  await logApiEvents(events);
}
