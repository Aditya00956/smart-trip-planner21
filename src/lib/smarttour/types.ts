export type InterestId =
  | "history"
  | "culture"
  | "nature"
  | "beaches"
  | "adventure"
  | "food"
  | "shopping"
  | "religious"
  | "museums"
  | "family";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Place {
  placeId: string;
  name: string;
  category: string;
  interests: InterestId[];
  description: string;
  rating: number | null;
  userRatingCount: number;
  priceLevel: number | null;
  location: LatLng;
  openNow: boolean | null;
  openingHours: string[];
  address: string;
  indoor: boolean;
  photoName?: string;
}

export interface WeatherSnapshot {
  temperatureC: number | null;
  condition: string;
  humidity: number | null;
  windKph: number | null;
  precipitationPercent: number | null;
  outdoorFriendly: boolean;
  available: boolean;
}

export interface WeatherForecastDay {
  date: string;
  maxTempC: number | null;
  minTempC: number | null;
  condition: string;
  precipitationPercent: number | null;
  outdoorFriendly: boolean;
}

export interface RouteLeg {
  fromPlaceId: string;
  toPlaceId: string;
  distanceKm: number;
  durationMin: number;
}

export interface UserPreferences {
  interests: InterestId[];
  budget: number;
  days: number;
  maxDistanceKm: number;
  transport: "car" | "transit" | "walk" | "bike";
  activityType: "relaxed" | "balanced" | "packed";
  indoorPreference: "indoor" | "outdoor" | "either";
}

export interface ScoredPlace {
  place: Place;
  score: number;
  reasons: string[];
  distanceKm: number;
  travelTimeMin: number;
  estimatedCost: number;
  weatherSuitable: boolean;
  breakdown: {
    interest: number;
    distance: number;
    rating: number;
    budget: number;
    weather: number;
    popularity: number;
  };
}

export interface ItineraryStop {
  time: string;
  kind: "attraction" | "meal" | "travel";
  placeId: string;
  name: string;
  category: string;
  durationMin: number;
  estimatedCost: number;
  travelFromPreviousKm: number;
  travelFromPreviousMin: number;
  location: LatLng;
  note: string;
}

export interface ItineraryDay {
  day: number;
  date: string | null;
  weather: WeatherForecastDay | null;
  stops: ItineraryStop[];
  totalDistanceKm: number;
  totalCost: number;
}

export interface CostBreakdown {
  transport: number;
  food: number;
  entryFees: number;
  accommodation: number;
  other: number;
  total: number;
  budget: number;
  remaining: number;
  perDay: number;
}

export interface ApiHealth {
  places: boolean;
  weather: boolean;
  routes: boolean;
  geocode: boolean;
  notes: string[];
}

export interface RecommendationResult {
  destination: { name: string; location: LatLng; formattedAddress: string };
  weather: WeatherSnapshot;
  forecast: WeatherForecastDay[];
  places: ScoredPlace[];
  health: ApiHealth;
  generatedInMs: number;
}
