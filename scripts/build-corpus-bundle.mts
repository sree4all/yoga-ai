import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const corpusDir = path.join(root, "docs", "routine-corpus");
const routinesPath = path.join(corpusDir, "routines.json");
const mappingPath = path.join(corpusDir, "intake-mapping.json");
const poseIndexPath = path.join(corpusDir, "pose-asset-index.json");
const enrichmentPath = path.join(corpusDir, "enrichment-library.json");
const bundlePath = path.join(corpusDir, "bundle.json");

async function readJson(filePath: string) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as unknown;
}

async function main() {
  const routines = (await readJson(routinesPath)) as unknown[];
  const intakeMapping = (await readJson(mappingPath)) as Record<string, string[]>;
  const poseAssetIndex = (await readJson(poseIndexPath)) as Record<string, unknown>;
  const enrichmentLibrary = (await readJson(enrichmentPath)) as unknown[];

  const bundle = {
    bundleVersion: process.env.CORPUS_BUNDLE_VERSION?.trim() || "1.0.0",
    schemaVersion: 1,
    routines,
    intakeMapping,
    poseAssetIndex,
    enrichmentLibrary,
    safetySubstitutions: {
      childs_pose: "easy_seated",
    },
  };

  await writeFile(bundlePath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
  console.log(`Wrote corpus bundle: ${bundlePath}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to build corpus bundle: ${message}`);
  process.exitCode = 1;
});
