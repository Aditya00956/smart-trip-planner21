/**
 * Google Maps Platform access layer (server-only).
 *
 * Every call goes through the Lovable connector gateway, so the private API key
 * never reaches the browser. Each helper returns a discriminated result so the
 * recommendation engine can degrade gracefully when one API is unavailable.
 */
import { INTERESTS, OUTDOOR_UNFRIENDLY } from "./constants";
import type {
  InterestId,
  LatLng,
  Place,
  WeatherForecastDay,
  WeatherSnapshot,
} from "./types";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const TIMEOUT_MS = 9000;

export interface ApiCall<T> {
  ok: boolean;
  data: T | null;
  status: number;
  latencyMs: number;
  message: string;
}

async function gateway<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; headers?: Record<string, string> } = {},
): Promise<ApiCall<T>> {
  const started = Date.now();
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !connectionKey) {
    return {
      ok: false,
      data: null,
      status: 0,
      latencyMs: 0,
      message: "Maps credentials are not configured on the server.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${GATEWAY_URL}${path}`, {
      method: init.method ?? "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      ...(init.body ? { body: JSON.stringify(init.body) } : {}),
    });
    const latencyMs = Date.now() - started;

    if (!response.ok) {
      const text = await response.text();
      console.error(`[smarttour] gateway ${path} failed [${response.status}]: ${text}`);
      return {
        ok: false,
        data: null,
        status: response.status,
        latencyMs,
        message: describeFailure(response.status, text),
      };
    }
    const data = (await response.json()) as T;
    return { ok: true, data, status: response.status, latencyMs, message: "" };
  } catch (error) {
    const latencyMs = Date.now() - started;
    const aborted = error instanceof Error && error.name === "AbortError";
    console.error(`[smarttour] gateway ${path} error:`, error);
    return {
      ok: false,
      data: null,
      status: aborted ? 504 : 500,
      latencyMs,
      message: aborted
        ? "The mapping service took too long to respond."
        : "The mapping service could not be reached.",
    };
  } finally {
    clearTimeout(timer);
  }
}

function describeFailure(status: number, body: string): string {
  if (status === 403) {
    if (body.includes("API_KEY_HTTP_REFERRER_BLOCKED"))
      return "Maps key is referrer-restricted; server calls are blocked.";
    if (body.includes("API_KEY_SERVICE_BLOCKED"))
      return "This Maps API is not enabled for the configured key.";
    return "The mapping service denied this request.";
  }
  if (status === 429) return "Mapping service rate limit reached. Please retry shortly.";
  if (status >= 500) return "The mapping service is temporarily unavailable.";
  return "The mapping service returned an unexpected response.";
}

/* ------------------------------- Geocoding ------------------------------- */

export interface GeocodeResult {
  name: string;
  formattedAddress: string;
  location: LatLng;
}

export async function geocode(address: string): Promise<ApiCall<GeocodeResult>> {
  const result = await gateway<{
    status: string;
    results: {
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
      address_components: { long_name: string; types: string[] }[];
    }[];
  }>(`/maps/api/geocode/json?address=${encodeURIComponent(address)}`);

  if (!result.ok || !result.data) return { ...result, data: null };
  const first = result.data.results?.[0];
  if (!first) {
    return {
      ...result,
      ok: false,
      data: null,
      message: `We couldn't find "${address}". Try a different place name.`,
    };
  }
  const locality =
    first.address_components.find((c) => c.types.includes("locality"))?.long_name ??
    first.formatted_address.split(",")[0]!;
  return {
    ...result,
    data: {
      name: locality,
      formattedAddress: first.formatted_address,
      location: first.geometry.location,
    },
  };
}

/* --------------------------------- Places -------------------------------- */

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  types?: string[];
  editorialSummary?: { text: string };
  currentOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  photos?: { name: string }[];
}

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

const INDOOR_TYPES = new Set([
  "museum",
  "art_gallery",
  "shopping_mall",
  "restaurant",
  "cafe",
  "performing_arts_theater",
  "church",
  "hindu_temple",
  "mosque",
  "synagogue",
  "aquarium",
  "market",
  "gift_shop",
  "cultural_landmark",
]);

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.types",
  "places.editorialSummary",
  "places.currentOpeningHours",
  "places.regularOpeningHours",
  "places.photos",
].join(",");

function toPlace(raw: GooglePlace): Place | null {
  if (!raw.location || !raw.displayName?.text) return null;
  const types = raw.types ?? [];
  const interests = INTERESTS.filter((interest) =>
    interest.placeTypes.some((t) => types.includes(t)),
  ).map((i) => i.id as InterestId);
  const primaryType = types[0] ?? "point_of_interest";
  return {
    placeId: raw.id,
    name: raw.displayName.text,
    category: primaryType.replaceAll("_", " "),
    interests: interests.length > 0 ? interests : inferInterests(types),
    description:
      raw.editorialSummary?.text ??
      `${primaryType.replaceAll("_", " ")} in ${raw.formattedAddress?.split(",")[1]?.trim() ?? "the area"}`,
    rating: raw.rating ?? null,
    userRatingCount: raw.userRatingCount ?? 0,
    priceLevel: raw.priceLevel ? (PRICE_LEVEL_MAP[raw.priceLevel] ?? null) : null,
    location: { lat: raw.location.latitude, lng: raw.location.longitude },
    openNow: raw.currentOpeningHours?.openNow ?? null,
    openingHours:
      raw.currentOpeningHours?.weekdayDescriptions ??
      raw.regularOpeningHours?.weekdayDescriptions ??
      [],
    address: raw.formattedAddress ?? "",
    indoor: types.some((t) => INDOOR_TYPES.has(t)),
    ...(raw.photos?.[0]?.name ? { photoName: raw.photos[0].name } : {}),
  };
}

function inferInterests(types: string[]): InterestId[] {
  if (types.includes("tourist_attraction")) return ["culture"];
  if (types.includes("lodging") || types.includes("hotel")) return [];
  return [];
}

export async function searchNearby(
  center: LatLng,
  includedTypes: string[],
  radiusMeters: number,
  maxResults = 20,
): Promise<ApiCall<Place[]>> {
  const result = await gateway<{ places?: GooglePlace[] }>("/places/v1/places:searchNearby", {
    method: "POST",
    headers: { "X-Goog-FieldMask": FIELD_MASK },
    body: {
      includedTypes,
      maxResultCount: Math.min(20, maxResults),
      rankPreference: "POPULARITY",
      locationRestriction: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: Math.min(50000, Math.max(500, radiusMeters)),
        },
      },
    },
  });
  if (!result.ok) return { ...result, data: null };
  const places = (result.data?.places ?? [])
    .map(toPlace)
    .filter((p): p is Place => p !== null);
  return { ...result, data: places };
}

export async function searchText(
  query: string,
  center: LatLng,
  radiusMeters = 20000,
): Promise<ApiCall<Place[]>> {
  const result = await gateway<{ places?: GooglePlace[] }>("/places/v1/places:searchText", {
    method: "POST",
    headers: { "X-Goog-FieldMask": FIELD_MASK },
    body: {
      textQuery: query,
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: Math.min(50000, radiusMeters),
        },
      },
    },
  });
  if (!result.ok) return { ...result, data: null };
  const places = (result.data?.places ?? [])
    .map(toPlace)
    .filter((p): p is Place => p !== null);
  return { ...result, data: places };
}

/* --------------------------------- Weather -------------------------------- */

function outdoorFriendly(condition: string, precipitationPercent: number | null): boolean {
  const text = condition.toLowerCase();
  if (OUTDOOR_UNFRIENDLY.some((word) => text.includes(word))) return false;
  if (precipitationPercent !== null && precipitationPercent >= 55) return false;
  return true;
}

export async function currentWeather(location: LatLng): Promise<ApiCall<WeatherSnapshot>> {
  const result = await gateway<{
    temperature?: { degrees: number };
    relativeHumidity?: number;
    wind?: { speed?: { value: number } };
    precipitation?: { probability?: { percent: number } };
    weatherCondition?: { description?: { text: string }; type?: string };
  }>(
    `/weather/v1/currentConditions:lookup?location.latitude=${location.lat}&location.longitude=${location.lng}`,
  );

  if (!result.ok || !result.data) {
    return {
      ...result,
      data: {
        temperatureC: null,
        condition: "Unavailable",
        humidity: null,
        windKph: null,
        precipitationPercent: null,
        outdoorFriendly: true,
        available: false,
      },
    };
  }
  const d = result.data;
  const condition = d.weatherCondition?.description?.text ?? d.weatherCondition?.type ?? "Clear";
  const precipitation = d.precipitation?.probability?.percent ?? null;
  return {
    ...result,
    data: {
      temperatureC: d.temperature?.degrees ?? null,
      condition,
      humidity: d.relativeHumidity ?? null,
      windKph: d.wind?.speed?.value ?? null,
      precipitationPercent: precipitation,
      outdoorFriendly: outdoorFriendly(condition, precipitation),
      available: true,
    },
  };
}

export async function weatherForecast(
  location: LatLng,
  days: number,
): Promise<ApiCall<WeatherForecastDay[]>> {
  const requested = Math.min(10, Math.max(1, days));
  const result = await gateway<{
    forecastDays?: {
      interval?: { startTime: string };
      displayDate?: { year: number; month: number; day: number };
      maxTemperature?: { degrees: number };
      minTemperature?: { degrees: number };
      daytimeForecast?: {
        weatherCondition?: { description?: { text: string }; type?: string };
        precipitation?: { probability?: { percent: number } };
      };
    }[];
  }>(
    `/weather/v1/forecast/days:lookup?location.latitude=${location.lat}&location.longitude=${location.lng}&days=${requested}`,
  );

  if (!result.ok || !result.data) return { ...result, data: null };

  const forecast: WeatherForecastDay[] = (result.data.forecastDays ?? []).map((day) => {
    const condition =
      day.daytimeForecast?.weatherCondition?.description?.text ??
      day.daytimeForecast?.weatherCondition?.type ??
      "Clear";
    const precipitation = day.daytimeForecast?.precipitation?.probability?.percent ?? null;
    const date = day.displayDate
      ? `${day.displayDate.year}-${String(day.displayDate.month).padStart(2, "0")}-${String(day.displayDate.day).padStart(2, "0")}`
      : (day.interval?.startTime?.slice(0, 10) ?? "");
    return {
      date,
      maxTempC: day.maxTemperature?.degrees ?? null,
      minTempC: day.minTemperature?.degrees ?? null,
      condition,
      precipitationPercent: precipitation,
      outdoorFriendly: outdoorFriendly(condition, precipitation),
    };
  });
  return { ...result, data: forecast };
}

/* --------------------------------- Routes --------------------------------- */

const TRAVEL_MODE: Record<string, string> = {
  car: "DRIVE",
  transit: "DRIVE",
  walk: "WALK",
  bike: "BICYCLE",
};

export interface MatrixEntry {
  destinationIndex: number;
  distanceKm: number;
  durationMin: number;
}

export async function routeMatrix(
  origin: LatLng,
  destinations: LatLng[],
  transport: string,
): Promise<ApiCall<MatrixEntry[]>> {
  if (destinations.length === 0) {
    return { ok: true, data: [], status: 200, latencyMs: 0, message: "" };
  }
  const result = await gateway<
    {
      destinationIndex?: number;
      distanceMeters?: number;
      duration?: string;
      condition?: string;
    }[]
  >("/routes/distanceMatrix/v2:computeRouteMatrix", {
    method: "POST",
    headers: {
      "X-Goog-FieldMask": "originIndex,destinationIndex,duration,distanceMeters,condition",
    },
    body: {
      origins: [
        {
          waypoint: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
        },
      ],
      destinations: destinations.slice(0, 25).map((d) => ({
        waypoint: { location: { latLng: { latitude: d.lat, longitude: d.lng } } },
      })),
      travelMode: TRAVEL_MODE[transport] ?? "DRIVE",
    },
  });

  if (!result.ok || !result.data) return { ...result, data: null };
  const entries: MatrixEntry[] = result.data
    .filter((row) => row.condition !== "ROUTE_NOT_FOUND" && row.distanceMeters !== undefined)
    .map((row) => ({
      destinationIndex: row.destinationIndex ?? 0,
      distanceKm: Math.round(((row.distanceMeters ?? 0) / 1000) * 100) / 100,
      durationMin: Math.round(Number((row.duration ?? "0s").replace("s", "")) / 60),
    }));
  return { ...result, data: entries };
}

export interface DirectionsRoute {
  distanceKm: number;
  durationMin: number;
  polyline: string;
}

export async function computeRoute(
  points: LatLng[],
  transport: string,
): Promise<ApiCall<DirectionsRoute>> {
  if (points.length < 2) {
    return { ok: false, data: null, status: 400, latencyMs: 0, message: "Need two or more stops." };
  }
  const [origin, ...rest] = points;
  const destination = rest.pop()!;
  const result = await gateway<{
    routes?: { distanceMeters?: number; duration?: string; polyline?: { encodedPolyline: string } }[];
  }>("/routes/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "X-Goog-FieldMask":
        "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
    },
    body: {
      origin: { location: { latLng: { latitude: origin!.lat, longitude: origin!.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      intermediates: rest
        .slice(0, 23)
        .map((p) => ({ location: { latLng: { latitude: p.lat, longitude: p.lng } } })),
      travelMode: TRAVEL_MODE[transport] ?? "DRIVE",
      optimizeWaypointOrder: false,
    },
  });

  if (!result.ok || !result.data?.routes?.[0]) return { ...result, ok: false, data: null };
  const route = result.data.routes[0];
  return {
    ...result,
    data: {
      distanceKm: Math.round(((route.distanceMeters ?? 0) / 1000) * 100) / 100,
      durationMin: Math.round(Number((route.duration ?? "0s").replace("s", "")) / 60),
      polyline: route.polyline?.encodedPolyline ?? "",
    },
  };
}
