import { parentPort, workerData } from "node:worker_threads";

const sharedArray = new Int32Array(workerData.sharedBuffer);

// Increment the shared counter 100,000 times
for (let i = 0; i < 10000; i++) {
  Atomics.add(sharedArray, 0, 1);
}

parentPort.postMessage("done");
