import type { APIRoute } from "astro";

type GooglePlaceDetailsResponse = {
  result?: {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    reviews?: Array<{
      author_name?: string;
      rating?: number;
      relative_time_description?: string;
      text?: string;
      time?: number;
    }>;
    url?: string;
  };
  status?: string;
  error_message?: string;
};

export const GET: APIRoute = async () => {
  const API_KEY = import.meta.env.GOOGLE_PLACES_API_KEY;
  const PLACE_ID = import.meta.env.GOOGLE_PLACE_ID;

  if (!API_KEY || !PLACE_ID) {
    return new Response(
      JSON.stringify({ error: "Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Place Details (legacy endpoint). Returns rating + up to ~5 reviews.
  const url =
    "https://maps.googleapis.com/maps/api/place/details/json" +
    `?place_id=${encodeURIComponent(PLACE_ID)}` +
    "&fields=name,rating,user_ratings_total,reviews,url" +
    `&key=${encodeURIComponent(API_KEY)}`;

  const resp = await fetch(url, { headers: { "Accept": "application/json" } });
  const data = (await resp.json()) as GooglePlaceDetailsResponse;

  if (!data?.result) {
    return new Response(
      JSON.stringify({
        error: "No result from Google Places",
        status: data?.status,
        message: data?.error_message,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = {
    name: data.result.name ?? "Climatop",
    rating: data.result.rating ?? null,
    totalReviews: data.result.user_ratings_total ?? null,
    googleUrl: data.result.url ?? null,
    // keep only safe fields
    reviews: (data.result.reviews ?? []).map((r) => ({
      author: r.author_name ?? "Google user",
      rating: r.rating ?? null,
      when: r.relative_time_description ?? null,
      text: r.text ?? "",
      time: r.time ?? null,
    })),
  };

  return new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Cache at the edge/CDN/server for 6 hours
      "Cache-Control": "public, max-age=21600",
    },
  });
};
