/**
 * Server-only media helpers — import only from Route Handlers or `server-only` modules.
 */

/** Default when env unset (align with research R7). */
export const DEFAULT_MEDIA_STEP_TIMEOUT_MS = 3000;

export const DEFAULT_MEDIA_ENRICH_BUDGET_MS = 8000;

export function mediaStepTimeoutMs(): number {
  const raw = process.env.MEDIA_STEP_TIMEOUT_MS?.trim();
  const n = raw ? parseInt(raw, 10) : DEFAULT_MEDIA_STEP_TIMEOUT_MS;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 30_000) : DEFAULT_MEDIA_STEP_TIMEOUT_MS;
}

export function mediaEnrichBudgetMs(): number {
  const raw = process.env.MEDIA_ENRICH_BUDGET_MS?.trim();
  const n = raw ? parseInt(raw, 10) : DEFAULT_MEDIA_ENRICH_BUDGET_MS;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 60_000) : DEFAULT_MEDIA_ENRICH_BUDGET_MS;
}

const YT_HOSTS = /^(https:\/\/)?(www\.)?(youtube\.com|youtu\.be)(\/|$)/i;

export function isAllowedHttpsImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Restrict navigable video links to YouTube watch / short domains (FR-004). */
export function isAllowedYoutubeHttpsUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && YT_HOSTS.test(u.href);
  } catch {
    return false;
  }
}

export const MEDIA_ENRICH_CONCURRENCY = 4;
