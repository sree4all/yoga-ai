import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  corpusBundleSchema,
  validateCorpusBundle,
} from "../src/lib/corpus/corpus-zod.ts";

const bundlePath = path.join(process.cwd(), "docs", "routine-corpus", "bundle.json");

async function main() {
  const raw = await readFile(bundlePath, "utf8");
  const json = JSON.parse(raw) as unknown;
  const bundle = corpusBundleSchema.parse(json);
  const issues = validateCorpusBundle(bundle);

  if (issues.length === 0) {
    console.log("Corpus validation passed.");
    return;
  }

  for (const issue of issues) {
    console.error(`[${issue.code}] ${issue.message}`);
  }
  process.exitCode = 1;
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Corpus validation failed: ${message}`);
  process.exitCode = 1;
});
