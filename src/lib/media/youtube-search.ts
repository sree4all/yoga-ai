import "server-only";

import https from "node:https";

import { isAllowedYoutubeHttpsUrl } from "@/lib/media/types";

export interface YoutubeSearchHit {
  watchUrl: string;
  title: string;
}

/** Strip common copy/paste issues; never log the key. */
function normalizeGoogleApiKey(raw: string): string {
  let s = raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  if (/^bearer\s+/i.test(s)) {
    s = s.replace(/^bearer\s+/i, "").trim();
  }
  return s;
}

/** Prefer `YOUTUBE_DATA_API_KEY`; common misnames supported. */
export function youtubeDataApiKeyFromEnv(): string {
  return normalizeGoogleApiKey(
    process.env.YOUTUBE_DATA_API_KEY ??
      process.env.YOUTUBE_API_KEY ??
      process.env.GOOGLE_API_KEY ??
      "",
  );
}

function httpsJsonGet(
  urlString: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
      return;
    }
    const u = new URL(urlString);
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: `${u.pathname}${u.search}`,
        method: "GET",
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    const onAbort = () => {
      req.destroy();
      reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    req.on("error", reject);
    req.on("close", () => signal.removeEventListener("abort", onAbort));
    req.end();
  });
}

type YoutubeErrorJson = {
  items?: { id?: { videoId?: string }; snippet?: { title?: string } }[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
    errors?: { reason?: string; domain?: string }[];
    details?: { "@type"?: string; reason?: string; metadata?: { service?: string } }[];
  };
};

function extractGoogleRpcErrorInfo(json: YoutubeErrorJson): {
  reason?: string;
  service?: string;
} {
  const details = json.error?.details;
  if (!Array.isArray(details)) return {};
  for (const d of details) {
    if (
      d &&
      d["@type"] === "type.googleapis.com/google.rpc.ErrorInfo" &&
      typeof d.reason === "string"
    ) {
      return {
        reason: d.reason,
        service:
          typeof d.metadata?.service === "string" ? d.metadata.service : undefined,
      };
    }
  }
  return {};
}

/**
 * YouTube Data API v3 search — returns first video result or null.
 * Sends the key as both `key` (query) and `X-Goog-Api-Key` (header). Uses `node:https` so Next.js
 * `fetch` caching / instrumentation cannot drop credentials (`CREDENTIALS_MISSING`).
 */
export async function searchYoutubeTutorial(
  poseId: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<YoutubeSearchHit | null> {
  const key = normalizeGoogleApiKey(apiKey);
  if (!key) return null;

  const q = `${poseId.replace(/_/g, " ")} yoga tutorial gentle`;
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("q", q);
  url.searchParams.set("key", key);

  const r = await httpsJsonGet(
    url.toString(),
    {
      Accept: "application/json",
      "X-Goog-Api-Key": key,
    },
    signal,
  );
  const statusCode = r.statusCode;
  const bodyText = r.body;

  if (statusCode === 429 || (statusCode >= 500 && statusCode < 600)) {
    throw new Error(`YouTube HTTP ${statusCode}`);
  }

  let json: YoutubeErrorJson;
  try {
    json = JSON.parse(bodyText) as YoutubeErrorJson;
  } catch {
    if (statusCode < 200 || statusCode >= 300) {
      console.warn(
        JSON.stringify({
          source: "yoga-ai-youtube",
          event: "search_parse_error",
          status: statusCode,
        }),
      );
    }
    return null;
  }

  if (statusCode < 200 || statusCode >= 300) {
    const rpc = extractGoogleRpcErrorInfo(json);
    const msg =
      json.error?.message ||
      json.error?.errors?.map((e) => e.reason).join("; ") ||
      bodyText.slice(0, 200);
    let hint: string | undefined;
    if (statusCode === 403) {
      hint =
        "If using Google Cloud API key restrictions: HTTP referrer rules block server-side calls (e.g. Vercel). Use Application restrictions: None, or a server-only key without referrer locks.";
    } else if (statusCode === 401) {
      if (rpc.reason === "CREDENTIALS_MISSING") {
        hint =
          "Google only returns this when no API key is on the request. Browser/curl tests must include &key=YOUR_KEY in the URL (opening the path without key always yields this JSON). For the app: set YOUTUBE_DATA_API_KEY in Vercel for Production, redeploy, and check logs for youtubeApiKeyLen > 0.";
      } else {
        hint =
          "Confirm the key is a Cloud API key with YouTube Data API v3 enabled and allowed on that key.";
      }
    }
    console.warn(
      JSON.stringify({
        source: "yoga-ai-youtube",
        event: "search_http_error",
        endpoint: "/youtube/v3/search",
        status: statusCode,
        message: msg.slice(0, 400),
        ...(rpc.reason ? { apiErrorReason: rpc.reason } : {}),
        ...(rpc.service ? { apiErrorService: rpc.service } : {}),
        ...(rpc.reason === "CREDENTIALS_MISSING"
          ? {
              youtubeApiKeyLen: key.length,
              queryHadKeyParam: url.searchParams.has("key"),
            }
          : {}),
        ...(hint ? { hint } : {}),
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
