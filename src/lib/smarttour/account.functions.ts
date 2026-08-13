import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  addFavoriteHandler,
  createTripHandler,
  deleteTripHandler,
  getProfileHandler,
  getTripHandler,
  isAdminHandler,
  listFavoritesHandler,
  listTripsHandler,
  logSearchHandler,
  recentRecommendationsHandler,
  removeFavoriteHandler,
  saveRecommendationsHandler,
  updateProfileHandler,
} from "./account.server";
import {
  favoriteSchema,
  idSchema,
  profileSchema,
  saveRecommendationsSchema,
  searchLogSchema,
  tripSchema,
} from "./schemas";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    getProfileHandler(context.supabase, context.userId, String(context.claims.email ?? "")),
  );

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileSchema.parse(data))
  .handler(async ({ context, data }) =>
    updateProfileHandler(context.supabase, context.userId, data),
  );

export const listTrips = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listTripsHandler(context.supabase, context.userId));

export const getTrip = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => getTripHandler(context.supabase, context.userId, data.id));

export const createTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => tripSchema.parse(data))
  .handler(async ({ context, data }) => createTripHandler(context.supabase, context.userId, data));

export const deleteTrip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) =>
    deleteTripHandler(context.supabase, context.userId, data.id),
  );

export const listFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listFavoritesHandler(context.supabase, context.userId));

export const addFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => favoriteSchema.parse(data))
  .handler(async ({ context, data }) => addFavoriteHandler(context.supabase, context.userId, data));

export const removeFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) =>
    removeFavoriteHandler(context.supabase, context.userId, data.id),
  );

export const saveRecommendations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveRecommendationsSchema.parse(data))
  .handler(async ({ context, data }) =>
    saveRecommendationsHandler(context.supabase, context.userId, data),
  );

export const recentRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => recentRecommendationsHandler(context.supabase, context.userId));

export const logSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => searchLogSchema.parse(data))
  .handler(async ({ context, data }) => logSearchHandler(context.userId, data));

export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => isAdminHandler(context.supabase, context.userId));
