import { useEffect, useRef, useState } from "react";

import type { LatLng } from "@/lib/smarttour/types";

export type MarkerKind = "recommended" | "attraction" | "restaurant" | "hotel" | "origin" | "stop";

export interface MapMarker {
  id: string;
  name: string;
  location: LatLng;
  kind: MarkerKind;
  label?: string;
}

interface MapViewProps {
  center: LatLng;
  markers: MapMarker[];
  route?: LatLng[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  zoom?: number;
}

const KIND_COLOR: Record<MarkerKind, string> = {
  recommended: "#5ee7d6",
  attraction: "#8ab6ff",
  restaurant: "#ffb066",
  hotel: "#c9a7ff",
  origin: "#ffffff",
  stop: "#5ee7d6",
};

declare global {
  interface Window {
    __smartTourMapReady?: boolean;
    __smartTourMapInit?: () => void;
  }
}

function loadMapsApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.__smartTourMapReady && window.google?.maps) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("smarttour-maps-js");
    const finish = () => resolve();
    if (existing) {
      if (window.__smartTourMapReady) return finish();
      existing.addEventListener("smarttour-maps-ready", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("maps-load-failed")), { once: true });
      return;
    }

    const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
    const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] ?? "";
    if (!key) return reject(new Error("maps-key-missing"));

    const script = document.createElement("script");
    script.id = "smarttour-maps-js";
    script.async = true;
    window.__smartTourMapInit = () => {
      window.__smartTourMapReady = true;
      script.dispatchEvent(new Event("smarttour-maps-ready"));
      finish();
    };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__smartTourMapInit&channel=${channel}`;
    script.addEventListener("error", () => reject(new Error("maps-load-failed")), { once: true });
    document.head.appendChild(script);
  });
}

export default function MapView({
  center,
  markers,
  route,
  selectedId,
  onSelect,
  className,
  zoom = 12,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRefs = useRef<Map<string, google.maps.Marker>>(new Map());
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    loadMapsApi()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google?.maps) return;
        mapRef.current = new window.google.maps.Map(containerRef.current, {
          center,
          zoom,
          disableDefaultUI: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          backgroundColor: "#0d1c22",
          styles: DARK_STYLE,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current) return;
    mapRef.current.panTo(center);
  }, [center, status]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google?.maps) return;
    const maps = window.google.maps;
    const map = mapRef.current;

    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current.clear();

    const bounds = new maps.LatLngBounds();
    markers.forEach((item) => {
      const marker = new maps.Marker({
        position: item.location,
        map,
        title: item.name,
        label: item.label
          ? { text: item.label, color: "#0d1c22", fontSize: "11px", fontWeight: "700" }
          : null,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: item.id === selectedId ? 13 : 10,
          fillColor: KIND_COLOR[item.kind],
          fillOpacity: 0.95,
          strokeColor: "#0d1c22",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => onSelect?.(item.id));
      markerRefs.current.set(item.id, marker);
      bounds.extend(item.location);
    });

    if (markers.length > 1) map.fitBounds(bounds, 64);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, selectedId, status]);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google?.maps) return;
    polylineRef.current?.setMap(null);
    if (!route || route.length < 2) return;
    polylineRef.current = new window.google.maps.Polyline({
      path: route,
      map: mapRef.current,
      strokeColor: "#5ee7d6",
      strokeOpacity: 0.9,
      strokeWeight: 4,
    });
  }, [route, status]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        role="application"
        aria-label="Interactive tourism map"
        className="h-full w-full rounded-2xl"
      />
      {status !== "ready" ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 p-6 text-center text-sm">
          {status === "loading" ? (
            <span className="text-muted-foreground">Loading map…</span>
          ) : (
            <span className="text-warning-foreground">
              The map could not load. Recommendations and itineraries below still work as a list.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#14262d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1c22" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9fc4cc" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#8aa9b0" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1c3a33" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e333b" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#a4c4cc" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#20353d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b2730" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4c8f9c" }] },
];
