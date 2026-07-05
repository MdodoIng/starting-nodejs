import fs from "node:fs";

// A fast readable source
const readable = fs.createReadStream("large-file.bin");

// A slow writable destination — simulate slowness with a delay
const writable = fs.createWriteStream("slow-output.bin");
const originalWrite = writable.write.bind(writable);
writable.write = function (chunk, ...args) {
  const result = originalWrite(chunk, ...args);
  console.log("Buffer level after write:", writable.writableLength);
  return result;
};

readable.pipe(writable);

readable.on("data", (chunk) => {
  writable.write(chunk); // no backpressure handling at all
});