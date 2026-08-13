import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

export interface AdminStats {
  totals: { users: number; searches: number; trips: number; favorites: number; recommendations: number };
  topDestinations: { label: string; count: number }[];
  topRecommended: { label: string; count: number }[];
  popularCategories: { label: string; count: number }[];
  apiStats: { api: string; calls: number; failures: number; avgLatencyMs: number }[];
  errors: { api: string; message: string; status: number | null; createdAt: string }[];
  searchesPerDay: { day: string; count: number }[];
}

function tally(values: string[], limit: number) {
  const counts = new Map<string, number>();
  values.forEach((value) => {
    const key = value.trim();
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Admin analytics. The caller must already be verified as an admin; this runs
 * with the caller's own RLS-scoped client, so the admin policies do the work.
 */
export async function adminStatsHandler(supabase: Client): Promise<AdminStats> {
  const [profiles, searches, trips, favorites, recommendations, apiEvents] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("search_events").select("query, created_at").order("created_at", { ascending: false }).limit(1000),
    supabase.from("trips").select("destination", { count: "exact" }).limit(1000),
    supabase.from("favorites").select("id", { count: "exact", head: true }),
    supabase.from("recommendations").select("name, category").limit(1000),
    supabase
      .from("api_events")
      .select("api, ok, status, latency_ms, message, created_at")
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  const searchRows = searches.data ?? [];
  const recRows = recommendations.data ?? [];
  const apiRows = apiEvents.data ?? [];

  const apiGrouped = new Map<string, { calls: number; failures: number; latency: number }>();
  apiRows.forEach((row) => {
    const current = apiGrouped.get(row.api) ?? { calls: 0, failures: 0, latency: 0 };
    current.calls += 1;
    if (!row.ok) current.failures += 1;
    current.latency += row.latency_ms;
    apiGrouped.set(row.api, current);
  });

  const perDay = new Map<string, number>();
  searchRows.forEach((row) => {
    const day = row.created_at.slice(0, 10);
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  });

  return {
    totals: {
      users: profiles.count ?? 0,
      searches: searchRows.length,
      trips: trips.count ?? 0,
      favorites: favorites.count ?? 0,
      recommendations: recRows.length,
    },
    topDestinations: tally(
      searchRows.map((r) => r.query),
      6,
    ),
    topRecommended: tally(
      recRows.map((r) => r.name),
      6,
    ),
    popularCategories: tally(
      recRows.map((r) => r.category || "uncategorised"),
      6,
    ),
    apiStats: [...apiGrouped.entries()]
      .map(([api, value]) => ({
        api,
        calls: value.calls,
        failures: value.failures,
        avgLatencyMs: Math.round(value.latency / value.calls),
      }))
      .sort((a, b) => b.calls - a.calls),
    errors: apiRows
      .filter((row) => !row.ok)
      .slice(0, 12)
      .map((row) => ({
        api: row.api,
        message: row.message ?? "Unknown error",
        status: row.status,
        createdAt: row.created_at,
      })),
    searchesPerDay: [...perDay.entries()]
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-14),
  };
}
