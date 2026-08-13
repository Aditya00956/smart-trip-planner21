import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isAdminHandler } from "./account.server";
import { adminStatsHandler } from "./admin.server";

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { admin } = await isAdminHandler(context.supabase, context.userId);
    if (!admin) throw new Error("Administrator access is required to view this dashboard.");
    return adminStatsHandler(context.supabase);
  });
