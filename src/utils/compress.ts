import { createReadStream, createWriteStream, unlinkSync } from "node:fs";
import { createGzip, createGunzip } from "node:zlib";
import { pipeline } from "node:stream/promises";

export async function gzipFile(inputPath: string): Promise<string> {
  const outputPath = `${inputPath}.gz`;
  await pipeline(
    createReadStream(inputPath),
    createGzip(),
    createWriteStream(outputPath),
  );
  unlinkSync(inputPath);
  return outputPath;
}

/**
 * Decompresses a .gz file to a temporary .sql file alongside it, returning
 * the path to the decompressed file. Caller is responsible for cleaning it
 * up once the restore is done.
 */
export async function gunzipFile(inputPath: string): Promise<string> {
  if (!inputPath.endsWith(".gz")) {
    throw new Error(`Expected a .gz file, got: ${inputPath}`);
  }
  const outputPath = inputPath.slice(0, -3); // strip ".gz"
  await pipeline(
    createReadStream(inputPath),
    createGunzip(),
    createWriteStream(outputPath),
  );
  return outputPath;
}
