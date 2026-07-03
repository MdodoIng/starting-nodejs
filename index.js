import express from "express";
import { getLocalIp } from "./src/network.js";
import qrcode from "qrcode-terminal";
import filesRouter from "./src/routes/files.js";
import qrRouter from "./src/routes/qr.js";

const app = express();
app.use(filesRouter);
app.use(qrRouter);
app.use(express.static("public"));

// "0.0.0.0" = listen on every network interface, not just localhost
app.listen(3000, "0.0.0.0", () => {
  const url = `http://${getLocalIp()}:3000`;
  console.log(`Open on another device: ${url}`);
  qrcode.generate(url, { small: true });
});
