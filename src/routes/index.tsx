import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";

import { CostSummary } from "@/components/smarttour/CostSummary";
import { GlassPanel, SectionHeading } from "@/components/smarttour/GlassPanel";
import { ItineraryTimeline } from "@/components/smarttour/ItineraryTimeline";
import MapView, { type MapMarker } from "@/components/smarttour/MapView";
import { PlaceCard } from "@/components/smarttour/PlaceCard";
import { PreferenceForm } from "@/components/smarttour/PreferenceForm";
import { WeatherCard } from "@/components/smarttour/WeatherCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_CENTER, DEFAULT_DESTINATION } from "@/lib/smarttour/constants";
import { decodePolyline } from "@/lib/smarttour/polyline";
import { DEFAULT_PREFERENCES } from "@/lib/smarttour/prefs";
import { generatePlan } from "@/lib/smarttour/tourism.functions";
import type { UserPreferences } from "@/lib/smarttour/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartTour — Smart Trip Planner for Kochi & Kerala" },
      {
        name: "description",
        content:
          "SmartTour builds personalised destination recommendations, weather-aware itineraries and optimised routes for Kochi, Kerala and beyond.",
      },
      { property: "og:title", content: "SmartTour — Smart Trip Planner" },
      {
        property: "og:description",
        content:
          "Discover attractions, compare ratings and distance, and auto-generate an optimised day-by-day itinerary.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [destination, setDestination] = useState(DEFAULT_DESTINATION);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const planFn = useServerFn(generatePlan);
  const plan = useMutation({
    mutationFn: (input: { destination: string; preferences: UserPreferences }) =>
      planFn({
        data: {
          destination: input.destination,
          preferences: input.preferences,
          includeAccommodation: input.preferences.days > 1,
        },
      }),
  });

  useEffect(() => {
    plan.mutate({ destination: DEFAULT_DESTINATION, preferences: DEFAULT_PREFERENCES });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = plan.data?.result ?? null;
  const recs = result?.recommendations ?? null;

  const markers: MapMarker[] = useMemo(() => {
    if (!recs) return [];
    return recs.places.slice(0, 12).map((scored, index) => ({
      id: scored.place.placeId,
      name: scored.place.name,
      location: scored.place.location,
      kind: index < 3 ? "recommended" : "attraction",
      label: String(index + 1),
    }));
  }, [recs]);

  const route = useMemo(
    () => (result?.routePolyline ? decodePolyline(result.routePolyline) : []),
    [result],
  );

  return (
    <main className="relative min-h-screen">
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-8 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Cloud tourism intelligence
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          Plan a smarter trip to <span className="text-gradient">{destination}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          SmartTour blends live places, weather and routing data into a weighted recommendation
          score, then turns the best matches into a day-by-day itinerary with cost estimates.
        </p>

        <GlassPanel strong className="mt-8 p-5 sm:p-6">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              plan.mutate({ destination, preferences });
            }}
          >
            <div className="flex-1">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                className="mt-2 glass"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Kochi, Kerala"
                required
                minLength={2}
              />
            </div>
            <Button type="submit" size="lg" disabled={plan.isPending}>
              {plan.isPending ? "Planning…" : "Generate plan"}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6">
            <PreferenceForm value={preferences} onChange={setPreferences} />
          </div>
        </GlassPanel>

        {plan.isError ? (
          <p className="mt-4 text-sm text-destructive">
            The planner could not complete that request. Please try a different destination.
          </p>
        ) : null}
        {plan.data && !plan.data.ok ? (
          <p className="mt-4 text-sm text-destructive">{plan.data.error}</p>
        ) : null}
      </section>

      {result ? (
        <>
          <section className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
              <GlassPanel className="relative h-[420px] overflow-hidden p-0">
                <MapView
                  className="relative h-full w-full"
                  center={recs?.destination.location ?? DEFAULT_CENTER}
                  markers={markers}
                  route={route}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              </GlassPanel>
              <div className="space-y-4">
                <WeatherCard
                  weather={recs!.weather}
                  forecast={recs!.forecast}
                  place={recs!.destination.name}
                />
                <CostSummary cost={result.cost} />
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <SectionHeading
              eyebrow="Recommendation engine"
              title="Top matches for your preferences"
              description="Scores combine interest match (30%), distance (20%), rating (15%), budget fit (15%), weather (10%) and popularity (10%)."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {recs!.places.slice(0, 8).map((scored) => (
                <PlaceCard
                  key={scored.place.placeId}
                  scored={scored}
                  selected={selectedId === scored.place.placeId}
                  onSelect={() => setSelectedId(scored.place.placeId)}
                />
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <SectionHeading
              eyebrow="Itinerary generator"
              title="Your optimised day-by-day plan"
              description="Stops are ordered with a nearest-neighbour route optimiser and adapted to the daily forecast."
            />
            <div className="mt-6">
              <ItineraryTimeline itinerary={result.itinerary} onSelectStop={setSelectedId} />
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
