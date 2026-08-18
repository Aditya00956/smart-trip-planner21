import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const PHOTO_NAME = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

export const Route = createFileRoute("/api/place-photo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const name = url.searchParams.get("name") ?? "";
        const width = Math.min(Math.max(Number(url.searchParams.get("w") ?? 800), 200), 1600);
        if (!PHOTO_NAME.test(name)) {
          return new Response("Invalid photo name", { status: 400 });
        }

        const lovableKey = process.env["LOVABLE_API_KEY"];
        const connectionKey = process.env["GOOGLE_MAPS_API_KEY"];
        if (!lovableKey || !connectionKey) {
          return new Response("Maps credentials are not configured", { status: 503 });
        }

        const response = await fetch(
          `${GATEWAY_URL}/places/v1/${name}/media?maxWidthPx=${width}&skipHttpRedirect=true`,
          {
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": connectionKey,
            },
          },
        );

        if (!response.ok) {
          const body = await response.text();
          console.error(`[smarttour] place photo failed [${response.status}]: ${body}`);
          return new Response(`Photo unavailable [${response.status}]`, { status: response.status });
        }

        const payload = (await response.json()) as { photoUri?: string };
        if (!payload.photoUri) {
          return new Response("Photo unavailable", { status: 404 });
        }

        const image = await fetch(payload.photoUri);
        if (!image.ok || !image.body) {
          return new Response("Photo unavailable", { status: 502 });
        }

        return new Response(image.body, {
          headers: {
            "Content-Type": image.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
