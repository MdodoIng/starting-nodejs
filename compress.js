import fs from "node:fs";
import zlib from "node:zlib";

fs.createReadStream("test.txt")
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream("test.txt.gz"));
