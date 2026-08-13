import type { SupabaseClient } from "@supabase/supabase-js";
import type { z } from "zod";

import type { Database } from "@/integrations/supabase/types";
import { logSearchEvent } from "./monitor.server";
import type {
  favoriteSchema,
  profileSchema,
  saveRecommendationsSchema,
  searchLogSchema,
  tripSchema,
} from "./schemas";

type Client = SupabaseClient<Database>;

function fail(message: string): never {
  throw new Error(message);
}

export async function getProfileHandler(supabase: Client, userId: string, email: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) fail("We couldn't load your profile. Please try again.");
  if (data) return data;

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: userId, email, name: email.split("@")[0] ?? "Traveller" })
    .select("*")
    .single();
  if (insertError) fail("We couldn't set up your profile. Please try again.");
  return created;
}

export async function updateProfileHandler(
  supabase: Client,
  userId: string,
  data: z.infer<typeof profileSchema>,
) {
  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      name: data.name,
      interests: data.interests,
      budget: data.budget,
      days: data.days,
      max_distance_km: data.maxDistanceKm,
      transport: data.transport,
      activity_type: data.activityType,
      indoor_preference: data.indoorPreference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) fail("We couldn't save your preferences. Please try again.");
  return updated;
}

export async function listTripsHandler(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) fail("We couldn't load your trips right now.");
  return data ?? [];
}

export async function getTripHandler(supabase: Client, userId: string, id: string) {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) fail("We couldn't load this trip.");
  if (!data) fail("That trip no longer exists.");
  return data;
}

export async function createTripHandler(
  supabase: Client,
  userId: string,
  data: z.infer<typeof tripSchema>,
) {
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    fail("The end date must be on or after the start date.");
  }
  const { data: trip, error } = await supabase
    .from("trips")
    .insert({
      user_id: userId,
      destination: data.destination,
      destination_lat: data.destinationLat ?? null,
      destination_lng: data.destinationLng ?? null,
      start_date: data.startDate ?? null,
      end_date: data.endDate ?? null,
      budget: data.budget,
      estimated_cost: data.estimatedCost,
      itinerary: data.itinerary as never,
      cost_breakdown: data.costBreakdown as never,
    })
    .select("*")
    .single();
  if (error) fail(error.message.includes("end date") ? error.message : "We couldn't save this trip.");
  return trip;
}

export async function deleteTripHandler(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("trips").delete().eq("id", id).eq("user_id", userId);
  if (error) fail("We couldn't delete this trip.");
  return { deleted: true };
}

export async function listFavoritesHandler(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) fail("We couldn't load your saved places.");
  return data ?? [];
}

export async function addFavoriteHandler(
  supabase: Client,
  userId: string,
  data: z.infer<typeof favoriteSchema>,
) {
  const { data: favorite, error } = await supabase
    .from("favorites")
    .upsert(
      {
        user_id: userId,
        place_id: data.placeId,
        name: data.name,
        category: data.category,
        rating: data.rating ?? null,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
      },
      { onConflict: "user_id,place_id", ignoreDuplicates: true },
    )
    .select("*")
    .maybeSingle();
  if (error) fail("We couldn't save this place.");
  return { saved: true, favorite };
}

export async function removeFavoriteHandler(supabase: Client, userId: string, id: string) {
  const { error } = await supabase.from("favorites").delete().eq("id", id).eq("user_id", userId);
  if (error) fail("We couldn't remove this saved place.");
  return { deleted: true };
}

export async function saveRecommendationsHandler(
  supabase: Client,
  userId: string,
  data: z.infer<typeof saveRecommendationsSchema>,
) {
  if (data.items.length === 0) return { saved: 0 };
  const { error } = await supabase.from("recommendations").insert(
    data.items.map((item) => ({
      user_id: userId,
      place_id: item.placeId,
      name: item.name,
      category: item.category,
      score: item.score,
      reasons: item.reasons as never,
    })),
  );
  if (error) fail("We couldn't store these recommendations.");
  return { saved: data.items.length };
}

export async function recentRecommendationsHandler(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) return [];
  return data ?? [];
}

export async function logSearchHandler(userId: string, data: z.infer<typeof searchLogSchema>) {
  await logSearchEvent(data.query, data.category, userId);
  return { logged: true };
}

export async function isAdminHandler(supabase: Client, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return { admin: Boolean(data) };
}
