import { z } from "zod";

export const interestSchema = z.enum([
  "history",
  "culture",
  "nature",
  "beaches",
  "adventure",
  "food",
  "shopping",
  "religious",
  "museums",
  "family",
]);

export const preferencesSchema = z.object({
  interests: z.array(interestSchema).max(10).default([]),
  budget: z.number().int().min(0).max(10_000_000).default(5000),
  days: z.number().int().min(1).max(14).default(3),
  maxDistanceKm: z.number().int().min(1).max(300).default(25),
  transport: z.enum(["car", "transit", "walk", "bike"]).default("car"),
  activityType: z.enum(["relaxed", "balanced", "packed"]).default("balanced"),
  indoorPreference: z.enum(["indoor", "outdoor", "either"]).default("either"),
});

export const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const destinationQuerySchema = z.object({
  query: z.string().trim().min(2, "Enter at least 2 characters").max(120),
});

export const recommendSchema = z.object({
  destination: z.string().trim().min(2).max(120),
  origin: latLngSchema.nullish(),
  preferences: preferencesSchema,
});

export const planSchema = recommendSchema.extend({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date")
    .nullish(),
  includeAccommodation: z.boolean().default(false),
});

export const nearbySchema = z.object({
  location: latLngSchema,
  category: z.enum(["restaurant", "hotel", "attraction", "museum", "park"]),
  radiusKm: z.number().min(1).max(50).default(10),
});

export const profileSchema = z.object({
  name: z.string().trim().max(80).default(""),
  interests: z.array(interestSchema).max(10).default([]),
  budget: z.number().int().min(0).max(10_000_000).default(5000),
  days: z.number().int().min(1).max(14).default(3),
  maxDistanceKm: z.number().int().min(1).max(300).default(25),
  transport: z.enum(["car", "transit", "walk", "bike"]).default("car"),
  activityType: z.enum(["relaxed", "balanced", "packed"]).default("balanced"),
  indoorPreference: z.enum(["indoor", "outdoor", "either"]).default("either"),
});

export const tripSchema = z.object({
  destination: z.string().trim().min(2).max(120),
  destinationLat: z.number().min(-90).max(90).nullish(),
  destinationLng: z.number().min(-180).max(180).nullish(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullish(),
  budget: z.number().int().min(0).max(10_000_000),
  estimatedCost: z.number().int().min(0).max(10_000_000),
  itinerary: z.array(z.unknown()).max(20),
  costBreakdown: z.record(z.string(), z.number()),
});

export const favoriteSchema = z.object({
  placeId: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().max(80).default(""),
  rating: z.number().min(0).max(5).nullish(),
  lat: z.number().min(-90).max(90).nullish(),
  lng: z.number().min(-180).max(180).nullish(),
});

export const idSchema = z.object({ id: z.string().uuid() });

export const saveRecommendationsSchema = z.object({
  items: z
    .array(
      z.object({
        placeId: z.string().min(1).max(200),
        name: z.string().min(1).max(200),
        category: z.string().max(80).default(""),
        score: z.number().int().min(0).max(100),
        reasons: z.array(z.string().max(200)).max(8),
      }),
    )
    .max(20),
});

export const searchLogSchema = z.object({
  query: z.string().trim().min(1).max(120),
  category: z.string().trim().max(40).default("destination"),
});
