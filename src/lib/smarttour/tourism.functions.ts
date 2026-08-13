import { createServerFn } from "@tanstack/react-start";

import { searchDestinationHandler, recommendHandler, planHandler, nearbyHandler } from "./tourism.server";
import { destinationQuerySchema, nearbySchema, planSchema, recommendSchema } from "./schemas";

export const searchDestination = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => destinationQuerySchema.parse(data))
  .handler(async ({ data }) => searchDestinationHandler(data));

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => recommendSchema.parse(data))
  .handler(async ({ data }) => recommendHandler(data));

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => planSchema.parse(data))
  .handler(async ({ data }) => planHandler(data));

export const getNearby = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => nearbySchema.parse(data))
  .handler(async ({ data }) => nearbyHandler(data));
