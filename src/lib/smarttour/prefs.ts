import type { InterestId, UserPreferences } from "./types";

export interface ProfileRow {
  name: string;
  email: string;
  interests: string[];
  budget: number;
  days: number;
  max_distance_km: number;
  transport: string;
  activity_type: string;
  indoor_preference: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  interests: ["history", "culture", "food"],
  budget: 5000,
  days: 3,
  maxDistanceKm: 25,
  transport: "car",
  activityType: "balanced",
  indoorPreference: "either",
};

export function profileToPreferences(profile: ProfileRow | null | undefined): UserPreferences {
  if (!profile) return DEFAULT_PREFERENCES;
  return {
    interests: profile.interests as InterestId[],
    budget: profile.budget,
    days: profile.days,
    maxDistanceKm: profile.max_distance_km,
    transport: profile.transport as UserPreferences["transport"],
    activityType: profile.activity_type as UserPreferences["activityType"],
    indoorPreference: profile.indoor_preference as UserPreferences["indoorPreference"],
  };
}

export const TRANSPORT_LABELS: Record<UserPreferences["transport"], string> = {
  car: "Car / taxi",
  transit: "Public transport",
  walk: "Walking",
  bike: "Bicycle",
};

export const ACTIVITY_LABELS: Record<UserPreferences["activityType"], string> = {
  relaxed: "Relaxed (3 stops/day)",
  balanced: "Balanced (4 stops/day)",
  packed: "Packed (6 stops/day)",
};

export const INDOOR_LABELS: Record<UserPreferences["indoorPreference"], string> = {
  indoor: "Mostly indoor",
  outdoor: "Mostly outdoor",
  either: "No preference",
};
