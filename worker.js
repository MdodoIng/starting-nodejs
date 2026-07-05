import { parentPort, workerData } from "node:worker_threads";

function processNumbers(numbers) {
  return {
    sum: numbers.reduce((a, b) => a + b, 0),
    max: Math.max(...numbers),
    min: Math.min(...numbers),
  };
}

const result = processNumbers(workerData.numbers);
parentPort.postMessage(result);
