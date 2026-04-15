import "server-only";

import { isAllowedHttpsImageUrl } from "@/lib/media/types";

export interface CommonsImageResult {
  imageUrl: string;
  attribution: string;
}

/**
 * Search Wikimedia Commons for a file and return a thumbnail URL + short attribution.
 */
export async function fetchCommonsImageForPose(
  poseId: string,
  signal: AbortSignal,
): Promise<CommonsImageResult | null> {
  const q = `${poseId.replace(/_/g, " ")} yoga`;
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", q);
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrlimit", "1");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|extmetadata");
  url.searchParams.set("iiurlwidth", "640");

  const res = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: "application/json",
      // https://meta.wikimedia.org/wiki/User-Agent_policy
      "User-Agent":
        "yoga-ai/1.0 (Wikimedia Commons API; educational yoga routine app)",
    },
    next: { revalidate: 0 },
  });
  if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
    throw new Error(`Commons HTTP ${res.status}`);
  }
  if (!res.ok) return null;

  const json = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          missing?: boolean;
          imageinfo?: {
            url?: string;
            /** Preferred for <img>: scaled JPEG/PNG thumb; full `url` can be SVG/TIFF/huge. */
            thumburl?: string;
            extmetadata?: Record<string, { value?: string }>;
          }[];
        }
      >;
    };
  };
  const pages = json.query?.pages;
  if (!pages) return null;
  const first = Object.values(pages)[0];
  if (!first || first.missing) return null;
  const info = first.imageinfo?.[0];
  const rawUrl = info?.thumburl || info?.url;
  if (!rawUrl || !isAllowedHttpsImageUrl(rawUrl)) return null;

  const artist = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "").trim();
  const license = info.extmetadata?.LicenseShortName?.value?.trim();
  const attribution = [artist, license].filter(Boolean).join(" — ") || "Wikimedia Commons";

  return { imageUrl: rawUrl, attribution };
}
