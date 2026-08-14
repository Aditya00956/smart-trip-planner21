import type { InterestId } from "./types";

export const DEFAULT_DESTINATION = "\u00a0India";
export const DEFAULT_CENTER = { lat: 9.9312, lng: 76.2673 };

export const INTERESTS: {
  id: InterestId;
  label: string;
  placeTypes: string[];
  indoor: boolean;
}[] = [
  { id: "history", label: "History", placeTypes: ["historical_landmark", "monument"], indoor: false },
  {
    id: "culture",
    label: "Culture",
    placeTypes: ["cultural_landmark", "performing_arts_theater", "art_gallery"],
    indoor: true,
  },
  { id: "nature", label: "Nature", placeTypes: ["park", "national_park", "garden"], indoor: false },
  { id: "beaches", label: "Beaches", placeTypes: ["beach"], indoor: false },
  {
    id: "adventure",
    label: "Adventure",
    placeTypes: ["adventure_sports_center", "hiking_area", "water_park"],
    indoor: false,
  },
  { id: "food", label: "Food", placeTypes: ["restaurant", "cafe"], indoor: true },
  {
    id: "shopping",
    label: "Shopping",
    placeTypes: ["shopping_mall", "market", "gift_shop"],
    indoor: true,
  },
  {
    id: "religious",
    label: "Religious places",
    placeTypes: ["church", "hindu_temple", "mosque", "synagogue"],
    indoor: true,
  },
  { id: "museums", label: "Museums", placeTypes: ["museum", "art_gallery"], indoor: true },
  {
    id: "family",
    label: "Family activities",
    placeTypes: ["zoo", "amusement_park", "aquarium"],
    indoor: false,
  },
];

export interface ScoreWeights {
  interest: number;
  distance: number;
  rating: number;
  budget: number;
  weather: number;
  popularity: number;
}

/** Transparent, configurable recommendation weights (must sum to 1). */
export const DEFAULT_WEIGHTS: ScoreWeights = {
  interest: 0.3,
  distance: 0.2,
  rating: 0.15,
  budget: 0.15,
  weather: 0.1,
  popularity: 0.1,
};

/** Indicative INR cost per price level, used for transparent estimates. */
export const PRICE_LEVEL_COST: Record<number, number> = {
  0: 0,
  1: 200,
  2: 500,
  3: 1200,
  4: 2500,
};

export const TRANSPORT_COST_PER_KM: Record<string, number> = {
  car: 18,
  transit: 6,
  walk: 0,
  bike: 8,
};

export const TRANSPORT_SPEED_KMH: Record<string, number> = {
  car: 32,
  transit: 22,
  walk: 4.5,
  bike: 14,
};

export const ACTIVITY_STOPS_PER_DAY: Record<string, number> = {
  relaxed: 3,
  balanced: 4,
  packed: 6,
};

export const OUTDOOR_UNFRIENDLY = [
  "rain",
  "thunder",
  "storm",
  "snow",
  "hail",
  "shower",
  "heavy",
  "wind",
];
