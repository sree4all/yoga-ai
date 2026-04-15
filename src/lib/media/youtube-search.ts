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
  if (!res.ok) return null;

  const json = (await res.json()) as {
    items?: { id?: { videoId?: string }; snippet?: { title?: string } }[];
  };
  const id = json.items?.[0]?.id?.videoId;
  const title = json.items?.[0]?.snippet?.title;
  if (!id) return null;

  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
  if (!isAllowedYoutubeHttpsUrl(watchUrl)) return null;

  return {
    watchUrl,
    title: title?.trim() || "YouTube reference",
  };
}
