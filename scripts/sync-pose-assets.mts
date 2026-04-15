import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const poseIndexPath = path.join(root, "docs", "routine-corpus", "pose-asset-index.json");
const outputDir = path.join(root, "public", "routine-corpus", "assets");

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const raw = await readFile(poseIndexPath, "utf8");
  const poseIndex = JSON.parse(raw) as Record<
    string,
    {
      stillImage?: { sourceTrainingDataPath?: string; path?: string };
    }
  >;

  await mkdir(outputDir, { recursive: true });
  let copied = 0;
  for (const [poseId, entry] of Object.entries(poseIndex)) {
    const sourceRel = entry.stillImage?.sourceTrainingDataPath;
    if (!sourceRel) continue;
    const sourcePath = path.join(root, sourceRel);
    const ext = path.extname(sourcePath) || ".svg";
    const filename = `${slugify(`yoga-${poseId}`)}${ext}`;
    const destinationPath = path.join(outputDir, filename);
    await copyFile(sourcePath, destinationPath);
    copied += 1;
  }
  console.log(`Synced ${copied} pose asset files to ${outputDir}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to sync pose assets: ${message}`);
  process.exitCode = 1;
});
