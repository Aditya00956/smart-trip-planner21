import {
  ACTIVITY_STOPS_PER_DAY,
  DEFAULT_WEIGHTS,
  PRICE_LEVEL_COST,
  TRANSPORT_COST_PER_KM,
  TRANSPORT_SPEED_KMH,
  type ScoreWeights,
} from "./constants";
import type {
  CostBreakdown,
  ItineraryDay,
  ItineraryStop,
  LatLng,
  Place,
  ScoredPlace,
  UserPreferences,
  WeatherForecastDay,
  WeatherSnapshot,
} from "./types";

/** Haversine distance in km — used as a fallback when the Routes API is unavailable. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 100) / 100;
}

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function estimateTravelMinutes(distanceKm: number, transport: string): number {
  const speed = TRANSPORT_SPEED_KMH[transport] ?? TRANSPORT_SPEED_KMH["car"]!;
  return Math.max(3, Math.round((distanceKm / speed) * 60));
}

export function estimatePlaceCost(place: Place): number {
  if (place.priceLevel !== null && PRICE_LEVEL_COST[place.priceLevel] !== undefined) {
    return PRICE_LEVEL_COST[place.priceLevel]!;
  }
  if (place.interests.includes("museums") || place.interests.includes("history")) return 300;
  if (place.interests.includes("food")) return 450;
  if (place.interests.includes("family") || place.interests.includes("adventure")) return 700;
  return 100;
}

/** Interest match: share of the user's interests covered by this place. */
export function interestScore(place: Place, interests: string[]): number {
  if (interests.length === 0) return 0.55; // neutral baseline → general recommendations
  const matches = place.interests.filter((i) => interests.includes(i));
  if (matches.length === 0) return 0.1;
  return clamp01(0.55 + 0.45 * (matches.length / Math.min(interests.length, 3)));
}

export function distanceScore(distanceKm: number, maxDistanceKm: number): number {
  const limit = Math.max(1, maxDistanceKm);
  return clamp01(1 - distanceKm / (limit * 1.5));
}

export function ratingScore(rating: number | null): number {
  if (rating === null) return 0.5;
  return clamp01((rating - 2.5) / 2.5);
}

/** Budget compatibility: per-place cost against the per-place share of the budget. */
export function budgetScore(cost: number, budget: number, days: number, stopsPerDay: number): number {
  if (budget <= 0) return cost <= 50 ? 1 : clamp01(1 - cost / 400);
  const share = budget / Math.max(1, days * stopsPerDay);
  if (cost <= share) return 1;
  return clamp01(1 - (cost - share) / (share * 2));
}

export function weatherScore(
  place: Place,
  weather: WeatherSnapshot,
  indoorPreference: UserPreferences["indoorPreference"],
): number {
  if (!weather.available) return 0.5; // graceful degradation when the weather API fails
  if (indoorPreference === "indoor" && !place.indoor) return 0.35;
  if (indoorPreference === "outdoor" && place.indoor) return 0.45;
  if (weather.outdoorFriendly) return place.indoor ? 0.7 : 1;
  return place.indoor ? 1 : 0.25;
}

export function popularityScore(userRatingCount: number): number {
  if (userRatingCount <= 0) return 0.2;
  return clamp01(Math.log10(userRatingCount + 1) / 4.5);
}

export interface ScoreInput {
  place: Place;
  origin: LatLng;
  preferences: UserPreferences;
  weather: WeatherSnapshot;
  weights?: ScoreWeights | undefined;
  /** Real distance/duration from the Routes API when available. */
  route?: { distanceKm: number; durationMin: number } | undefined;
}

export function scorePlace(input: ScoreInput): ScoredPlace {
  const { place, origin, preferences, weather } = input;
  const weights = input.weights ?? DEFAULT_WEIGHTS;
  const stopsPerDay = ACTIVITY_STOPS_PER_DAY[preferences.activityType] ?? 4;

  const distanceKm = input.route?.distanceKm ?? haversineKm(origin, place.location);
  const travelTimeMin =
    input.route?.durationMin ?? estimateTravelMinutes(distanceKm, preferences.transport);
  const estimatedCost = estimatePlaceCost(place);

  const breakdown = {
    interest: interestScore(place, preferences.interests),
    distance: distanceScore(distanceKm, preferences.maxDistanceKm),
    rating: ratingScore(place.rating),
    budget: budgetScore(estimatedCost, preferences.budget, preferences.days, stopsPerDay),
    weather: weatherScore(place, weather, preferences.indoorPreference),
    popularity: popularityScore(place.userRatingCount),
  };

  const raw =
    breakdown.interest * weights.interest +
    breakdown.distance * weights.distance +
    breakdown.rating * weights.rating +
    breakdown.budget * weights.budget +
    breakdown.weather * weights.weather +
    breakdown.popularity * weights.popularity;

  const score = Math.round(clamp01(raw) * 100);

  const matched = place.interests.filter((i) => preferences.interests.includes(i));
  const reasons: string[] = [];
  if (matched.length > 0) {
    reasons.push(`Matches your ${matched.slice(0, 2).join(" and ")} interest`);
  } else if (preferences.interests.length === 0) {
    reasons.push("Popular general pick — add interests for sharper matches");
  }
  if (breakdown.distance > 0.6) reasons.push(`${distanceKm} km from your starting point`);
  else if (distanceKm > preferences.maxDistanceKm)
    reasons.push(`${distanceKm} km away — beyond your ${preferences.maxDistanceKm} km limit`);
  if (breakdown.rating > 0.7 && place.rating) reasons.push(`Highly rated ${place.rating}/5`);
  if (breakdown.budget >= 0.95) reasons.push(`Within budget (approx ₹${estimatedCost})`);
  else if (breakdown.budget < 0.5) reasons.push(`Pricier than your budget share (₹${estimatedCost})`);
  if (!weather.available) reasons.push("Weather data unavailable — scored on other factors");
  else if (breakdown.weather >= 0.9)
    reasons.push(place.indoor ? "Indoor option suits current weather" : "Good weather conditions");
  else if (breakdown.weather <= 0.3) reasons.push("Weather is poor for outdoor visits");
  if (breakdown.popularity > 0.7) reasons.push(`Visited often (${place.userRatingCount}+ reviews)`);

  return {
    place,
    score,
    reasons,
    distanceKm,
    travelTimeMin,
    estimatedCost,
    weatherSuitable: breakdown.weather >= 0.6,
    breakdown,
  };
}

export function rankPlaces(
  places: Place[],
  origin: LatLng,
  preferences: UserPreferences,
  weather: WeatherSnapshot,
  routes?: Map<string, { distanceKm: number; durationMin: number }>,
  weights?: ScoreWeights,
): ScoredPlace[] {
  return places
    .map((place) =>
      scorePlace({
        place,
        origin,
        preferences,
        weather,
        weights,
        route: routes?.get(place.placeId),
      }),
    )
    .sort((a, b) => b.score - a.score);
}

/** Nearest-neighbour route optimisation over the chosen stops. */
export function optimiseOrder(origin: LatLng, places: Place[]): Place[] {
  const remaining = [...places];
  const ordered: Place[] = [];
  let cursor = origin;
  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    remaining.forEach((place, index) => {
      const d = haversineKm(cursor, place.location);
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = index;
      }
    });
    const next = remaining.splice(bestIndex, 1)[0]!;
    ordered.push(next);
    cursor = next.location;
  }
  return ordered;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h! * 60 + m! + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h! >= 12 ? "PM" : "AM";
  const hour = h! % 12 === 0 ? 12 : h! % 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

export interface ItineraryInput {
  origin: LatLng;
  ranked: ScoredPlace[];
  preferences: UserPreferences;
  forecast: WeatherForecastDay[];
  startDate?: string | null | undefined;
}

/**
 * Day-by-day itinerary: weather-aware day assignment, nearest-neighbour route
 * optimisation per day, lunch and dinner inserted around travel time, and
 * opening-hours awareness where the Places API supplied it.
 */
export function buildItinerary(input: ItineraryInput): ItineraryDay[] {
  const { origin, ranked, preferences, forecast } = input;
  const days = Math.max(1, Math.min(14, preferences.days));
  const stopsPerDay = ACTIVITY_STOPS_PER_DAY[preferences.activityType] ?? 4;

  const attractions = ranked.filter((r) => !r.place.interests.includes("food"));
  const eateries = ranked.filter((r) => r.place.interests.includes("food"));

  const pool = attractions.slice(0, days * stopsPerDay);
  const buckets: ScoredPlace[][] = Array.from({ length: days }, () => []);

  // Weather-aware assignment: rainy days receive indoor-heavy stops.
  const dayOrder = Array.from({ length: days }, (_, i) => i).sort((a, b) => {
    const fa = forecast[a]?.outdoorFriendly === false ? 1 : 0;
    const fb = forecast[b]?.outdoorFriendly === false ? 1 : 0;
    return fa - fb;
  });

  const indoorFirst = [...pool].sort((a, b) => Number(b.place.indoor) - Number(a.place.indoor));
  const outdoorFirst = [...pool].sort((a, b) => Number(a.place.indoor) - Number(b.place.indoor));
  const used = new Set<string>();

  dayOrder.forEach((dayIndex) => {
    const rainy = forecast[dayIndex]?.outdoorFriendly === false;
    const source = rainy ? indoorFirst : outdoorFirst;
    for (const candidate of source) {
      if (buckets[dayIndex]!.length >= stopsPerDay) break;
      if (used.has(candidate.place.placeId)) continue;
      used.add(candidate.place.placeId);
      buckets[dayIndex]!.push(candidate);
    }
  });

  const startDate = input.startDate ? new Date(input.startDate) : null;

  return buckets.map((bucket, index) => {
    const ordered = optimiseOrder(
      origin,
      bucket.map((b) => b.place),
    );
    const stops: ItineraryStop[] = [];
    let cursor: LatLng = origin;
    let time = "09:00";
    let totalDistance = 0;
    let totalCost = 0;
    let lunchAdded = false;
    let dinnerAdded = false;

    ordered.forEach((place, position) => {
      const scored = bucket.find((b) => b.place.placeId === place.placeId)!;
      const legKm = haversineKm(cursor, place.location);
      const legMin = estimateTravelMinutes(legKm, preferences.transport);
      time = addMinutes(time, position === 0 ? legMin : legMin + 15);

      if (!lunchAdded && Number(time.slice(0, 2)) >= 13) {
        const lunch = eateries[0];
        if (lunch) {
          stops.push(mealStop(time, lunch, "Lunch break"));
          totalCost += lunch.estimatedCost;
          time = addMinutes(time, 60);
        }
        lunchAdded = true;
      }

      const visitMin = place.indoor ? 75 : 90;
      stops.push({
        time,
        kind: "attraction",
        placeId: place.placeId,
        name: place.name,
        category: place.category,
        durationMin: visitMin,
        estimatedCost: scored.estimatedCost,
        travelFromPreviousKm: legKm,
        travelFromPreviousMin: legMin,
        location: place.location,
        note:
          place.openingHours.length > 0
            ? `Opening hours: ${place.openingHours[0]}`
            : scored.reasons[0] ?? "",
      });
      totalDistance += legKm;
      totalCost += scored.estimatedCost;
      time = addMinutes(time, visitMin);
      cursor = place.location;
    });

    if (!dinnerAdded) {
      const dinner = eateries[1] ?? eateries[0];
      if (dinner && stops.length > 0) {
        const dinnerTime = Number(time.slice(0, 2)) < 18 ? "18:30" : time;
        stops.push(mealStop(dinnerTime, dinner, "Dinner"));
        totalCost += dinner.estimatedCost;
      }
      dinnerAdded = true;
    }

    const date = startDate
      ? new Date(startDate.getTime() + index * 86400000).toISOString().slice(0, 10)
      : null;

    return {
      day: index + 1,
      date,
      weather: forecast[index] ?? null,
      stops,
      totalDistanceKm: Math.round(totalDistance * 10) / 10,
      totalCost: Math.round(totalCost),
    };
  });
}

function mealStop(time: string, scored: ScoredPlace, note: string): ItineraryStop {
  return {
    time,
    kind: "meal",
    placeId: scored.place.placeId,
    name: scored.place.name,
    category: scored.place.category,
    durationMin: 60,
    estimatedCost: scored.estimatedCost,
    travelFromPreviousKm: 0,
    travelFromPreviousMin: 0,
    location: scored.place.location,
    note,
  };
}

export function estimateTripCost(
  itinerary: ItineraryDay[],
  preferences: UserPreferences,
  options: { includeAccommodation?: boolean; accommodationPerNight?: number } = {},
): CostBreakdown {
  const perKm = TRANSPORT_COST_PER_KM[preferences.transport] ?? 18;
  const distance = itinerary.reduce((sum, day) => sum + day.totalDistanceKm, 0) * 2;
  const transport = Math.round(distance * perKm);

  let food = 0;
  let entryFees = 0;
  itinerary.forEach((day) =>
    day.stops.forEach((stop) => {
      if (stop.kind === "meal") food += stop.estimatedCost;
      else entryFees += stop.estimatedCost;
    }),
  );
  food = Math.round(food + itinerary.length * 250);
  entryFees = Math.round(entryFees);

  const nights = Math.max(0, itinerary.length - 1);
  const accommodation = options.includeAccommodation
    ? nights * (options.accommodationPerNight ?? 1800)
    : 0;
  const other = Math.round((transport + food + entryFees) * 0.12);
  const total = transport + food + entryFees + accommodation + other;

  return {
    transport,
    food,
    entryFees,
    accommodation,
    other,
    total,
    budget: preferences.budget,
    remaining: preferences.budget - total,
    perDay: Math.round(total / Math.max(1, itinerary.length)),
  };
}

export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}
