import net from "node:net";

const server = net.createServer((socket) => {
  // socket is duplex: readable (client → server) AND writable (server → client)
  socket.on("data", (data) => {
    console.log("Received:", data.toString());
    socket.write(`Echo: ${data}`); // writing back on the same stream
  });
});

server.listen(4000, () => console.log("TCP server on port 4000"));