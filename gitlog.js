import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);

const { stdout } = await execFileAsync("git", [
  "log",
  "-5",
  "--pretty=format:%h %s",
]);
