import { Clock, Heart, MapPin, Navigation, Plus, Star } from "lucide-react";

import { GlassPanel } from "./GlassPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/smarttour/recommendation";
import type { ScoredPlace } from "@/lib/smarttour/types";

interface PlaceCardProps {
  scored: ScoredPlace;
  selected?: boolean;
  onSelect?: () => void;
  onAddToTrip?: () => void;
  onFavorite?: () => void;
  favorited?: boolean;
}

export function PlaceCard({
  scored,
  selected,
  onSelect,
  onAddToTrip,
  onFavorite,
  favorited,
}: PlaceCardProps) {
  const { place } = scored;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}&destination_place_id=${place.placeId}`;
  const photoUrl = place.photoName
    ? `/api/place-photo?name=${encodeURIComponent(place.photoName)}&w=800`
    : null;

  return (
    <GlassPanel
      as="article"
      interactive
      className={selected ? "p-5 ring-2 ring-primary" : "p-5"}
      aria-label={`${place.name}, ${scored.score}% match`}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`${place.name} in ${place.address || "the destination"}`}
          loading="lazy"
          className="mb-4 h-44 w-full rounded-xl border border-border object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
      <div className="flex items-start justify-between gap-3">

        <div>
          <h3 className="text-lg font-semibold leading-tight">{place.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            {place.category}
            {place.indoor ? " · indoor" : " · outdoor"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-2xl font-semibold text-gradient">{scored.score}%</div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">match</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{place.description}</p>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[11px] uppercase text-muted-foreground">Rating</dt>
          <dd className="flex items-center gap-1 font-medium">
            <Star aria-hidden className="size-3.5 text-warning" />
            {place.rating ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase text-muted-foreground">Distance</dt>
          <dd className="flex items-center gap-1 font-medium">
            <MapPin aria-hidden className="size-3.5 text-primary" />
            {scored.distanceKm} km
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase text-muted-foreground">Travel</dt>
          <dd className="flex items-center gap-1 font-medium">
            <Clock aria-hidden className="size-3.5 text-primary" />
            {scored.travelTimeMin} min
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase text-muted-foreground">Est. cost</dt>
          <dd className="font-medium">{formatINR(scored.estimatedCost)}</dd>
        </div>
      </dl>

      {place.openingHours[0] ? (
        <p className="mt-3 text-xs text-muted-foreground">Hours: {place.openingHours[0]}</p>
      ) : null}

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Why recommended?
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {scored.reasons.slice(0, 5).map((reason) => (
            <li key={reason} className="flex gap-2">
              <span aria-hidden className="text-primary">
                ✓
              </span>
              <span className="text-muted-foreground">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant={scored.weatherSuitable ? "secondary" : "outline"}>
          Weather {scored.weatherSuitable ? "suitable" : "not ideal"}
        </Badge>
        {onSelect ? (
          <Button size="sm" variant="secondary" onClick={onSelect}>
            View on map
          </Button>
        ) : null}
        <Button size="sm" variant="outline" asChild>
          <a href={directionsUrl} target="_blank" rel="noreferrer noopener">
            <Navigation aria-hidden className="size-4" /> Directions
          </a>
        </Button>
        {onAddToTrip ? (
          <Button size="sm" onClick={onAddToTrip}>
            <Plus aria-hidden className="size-4" /> Add to trip
          </Button>
        ) : null}
        {onFavorite ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={onFavorite}
            aria-label={favorited ? `Remove ${place.name} from favourites` : `Save ${place.name}`}
          >
            <Heart aria-hidden className={favorited ? "size-4 fill-accent text-accent" : "size-4"} />
          </Button>
        ) : null}
      </div>
    </GlassPanel>
  );
}
