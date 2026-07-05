import { Worker } from "node:worker_threads";

const sharedBuffer = new SharedArrayBuffer(4);
const sharedArray = new Int32Array(sharedBuffer);

let finished = 0;
const totalWorkers = 4;

for (let i = 0; i < totalWorkers; i++) {
  finished++;
  if (finished === totalWorkers) {
    console.log("Final count:", Atomics.load(sharedArray, 0));
    console.log("Expected:", 100000 * totalWorkers);
  }
}
