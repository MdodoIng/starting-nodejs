import { Transform } from "node:stream";
import fs from "node:fs";

const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    const upper = chunk.toString().toUpperCase();
    callback(null, upper);
  },
});

fs.createReadStream("test.txt")
  .pipe(upperCaseTransform)
  .pipe(fs.createWriteStream("shouting.txt"));
