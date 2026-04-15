import "server-only";

import { isAllowedYoutubeHttpsUrl } from "@/lib/media/types";

export interface YoutubeSearchHit {
  watchUrl: string;
  title: string;
}

/**
 * YouTube Data API v3 search — returns first video result or null.
 */
export async function searchYoutubeTutorial(
  poseId: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<YoutubeSearchHit | null> {
  const key = apiKey.trim();
  if (!key) return null;

  const q = `${poseId.replace(/_/g, " ")} yoga tutorial gentle`;
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("q", q);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), {
    signal,
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });
  if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
    throw new Error(`YouTube HTTP ${res.status}`);
  }

  const bodyText = await res.text();
  let json: {
    items?: { id?: { videoId?: string }; snippet?: { title?: string } }[];
    error?: { code?: number; message?: string; errors?: { reason?: string }[] };
  };
  try {
    json = JSON.parse(bodyText) as typeof json;
  } catch {
    if (!res.ok) {
      console.warn(
        JSON.stringify({
          source: "yoga-ai-youtube",
          event: "search_parse_error",
          status: res.status,
        }),
      );
    }
    return null;
  }

  if (!res.ok) {
    const msg =
      json.error?.message ||
      json.error?.errors?.map((e) => e.reason).join("; ") ||
      bodyText.slice(0, 200);
    console.warn(
      JSON.stringify({
        source: "yoga-ai-youtube",
        event: "search_http_error",
        status: res.status,
        message: msg.slice(0, 400),
        hint:
          res.status === 403
            ? "If using Google Cloud API key restrictions: HTTP referrer rules block server-side calls (e.g. Vercel). Use Application restrictions: None, or a server-only key without referrer locks."
            : undefined,
      }),
    );
    return null;
  }
  const id = json.items?.[0]?.id?.videoId;
  const title = json.items?.[0]?.snippet?.title;
  if (!id) {
    return null;
  }

  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
  if (!isAllowedYoutubeHttpsUrl(watchUrl)) return null;

  return {
    watchUrl,
    title: title?.trim() || "YouTube reference",
  };
}
