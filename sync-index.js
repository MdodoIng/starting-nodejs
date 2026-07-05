import { Worker } from "node:worker_threads";

const sharedBuffer = new SharedArrayBuffer(4);
const sharedArray = new Int32Array(sharedBuffer);

const worker = new Worker("./sync-worker.js", { workerData: { sharedBuffer } });
worker.on("message", () => console.log("Main: worker finished"));

setTimeout(() => {
  console.log("Main: sending signal now");
  Atomics.store(sharedArray, 0, 42);
  Atomics.notify(sharedArray, 0, 1); // wake up 1 thread waiting on index 0
}, 2000);