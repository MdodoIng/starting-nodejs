process.on("message", (msg) => {
  console.log("Worker received:", msg);
  const result = msg.n * 2;
  process.send({ result }, () => {
    process.exit(0);
  });
});