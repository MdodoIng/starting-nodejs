import { parentPort } from "node:worker_threads";
let count = 0;

parentPort.on("message", (msg) => {
  if (msg.action === "increment") {
    count += msg.amount;
    parentPort.postMessage({ count });
  }
  if (msg.action === "reset") {
    count = 0;
    parentPort.postMessage({ count });
  }
});

console.log("Worker started and listening for messages");
