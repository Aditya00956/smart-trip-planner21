import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface ApiEventInput {
  api: string;
  ok: boolean;
  status: number;
  latencyMs: number;
  message?: string;
  userId?: string | null;
}

/**
 * Cloud monitoring: every external API call is logged with latency and outcome
 * so the admin dashboard can report reliability and performance.
 * Logging must never break the user request.
 */
export async function logApiEvents(events: ApiEventInput[]): Promise<void> {
  if (events.length === 0) return;
  try {
    await supabaseAdmin.from("api_events").insert(
      events.map((event) => ({
        api: event.api,
        ok: event.ok,
        status: event.status,
        latency_ms: event.latencyMs,
        message: event.message?.slice(0, 300) ?? null,
        user_id: event.userId ?? null,
      })),
    );
  } catch (error) {
    console.error("[smarttour] failed to log api events", error);
  }
}

export async function logSearchEvent(
  query: string,
  category: string,
  userId?: string | null,
): Promise<void> {
  try {
    await supabaseAdmin
      .from("search_events")
      .insert({ query: query.slice(0, 120), category, user_id: userId ?? null });
  } catch (error) {
    console.error("[smarttour] failed to log search event", error);
  }
}
