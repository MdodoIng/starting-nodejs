import fs from "node:fs";

const readable = fs.createReadStream("test.txt", {
  encoding: "utf-8",
  highWaterMark: 5, // read only 5 bytes at a time — tiny, just to observe chunking
});

const writable = fs.createWriteStream("output.txt");

let chunkCount = 0;
readable.on("data", (chunk) => {
  chunkCount++;
  console.log(`Chunk ${chunkCount}:`, JSON.stringify(chunk));
});

readable.on("end", () => console.log(`Total chunks: ${chunkCount}`));

writable.write("First line\n");
writable.write("Second line\n");
writable.end("Final line\n"); // .end() writes one last chunk, then closes the stream

writable.on("finish", () => console.log("All data written"));

readable.pipe(writable);

writable.on("finish", () => console.log("Copy complete"));
