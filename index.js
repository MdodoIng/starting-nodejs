import { Worker } from "node:worker_threads";

const worker = new Worker("./counter-worker.js");

worker.on("message", (msg) => console.log("Main received:", msg));

worker.postMessage({ action: "increment", amount: 5 });
worker.postMessage({ action: "increment", amount: 3 });
worker.postMessage({ action: "reset" });

setTimeout(() => worker.terminate(), 2000);
