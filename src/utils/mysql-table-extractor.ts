import { readFileSync } from "node:fs";

/**
 * mysqldump's default plain-SQL output wraps each table in a comment marker:
 *   -- Table structure for table `users`
 *   ...CREATE TABLE...
 *   -- Dumping data for table `users`
 *   ...INSERT statements...
 * This walks the file and pulls out only the blocks for the requested tables.
 */
export function extractTableStatements(
  sqlFilePath: string,
  tables: string[],
): string {
  const content = readFileSync(sqlFilePath, "utf-8");
  const lines = content.split("\n");
  const wanted = new Set(tables);

  const output: string[] = [];
  let capturing = false;
  let currentTable: string | null = null;

  const tableMarkerRe =
    /-- (?:Table structure for table|Dumping data for table) `([^`]+)`/;

  for (const line of lines) {
    const match = line.match(tableMarkerRe);
    if (match) {
      currentTable = match[1];
      capturing = wanted.has(currentTable);
    }
    // Also always keep header pragmas (SET statements at the very top) so
    // character sets / foreign key checks are configured correctly.
    if (line.startsWith("/*!") || line.startsWith("SET ")) {
      output.push(line);
      continue;
    }
    if (capturing) {
      output.push(line);
    }
  }

  if (output.length === 0) {
    throw new Error(
      `No matching table blocks found for [${tables.join(", ")}]. ` +
        `Check the table names match exactly (case-sensitive) what's in the dump.`,
    );
  }

  return output.join("\n");
}
