import path from "node:path";

export const ROUTINE_CORPUS_DIR = path.join(process.cwd(), "docs", "routine-corpus");
export const ROUTINE_CORPUS_BUNDLE_PATH = path.join(ROUTINE_CORPUS_DIR, "bundle.json");
export const ROUTINE_CORPUS_ROUTINES_PATH = path.join(ROUTINE_CORPUS_DIR, "routines.json");
export const ROUTINE_CORPUS_MAPPING_PATH = path.join(
  ROUTINE_CORPUS_DIR,
  "intake-mapping.json",
);
export const ROUTINE_CORPUS_POSE_INDEX_PATH = path.join(
  ROUTINE_CORPUS_DIR,
  "pose-asset-index.json",
);
export const ROUTINE_CORPUS_ENRICHMENT_PATH = path.join(
  ROUTINE_CORPUS_DIR,
  "enrichment-library.json",
);

export const ROUTINE_CORPUS_ASSET_PUBLIC_PREFIX = "/routine-corpus/assets/";
