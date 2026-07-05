import { parentPort, workerData } from "node:worker_threads";

const sharedArray = new Int32Array(workerData.sharedBuffer);

console.log("Worker waiting for signal...");
Atomics.wait(sharedArray, 0, 0); // blocks THIS THREAD until index 0 is no longer 0
console.log(
  "Worker received signal! Value is now:",
  Atomics.load(sharedArray, 0),
);

parentPort.postMessage("done");
