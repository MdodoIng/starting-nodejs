import { Router } from "express";
import QRCode from "qrcode";
import { getLocalIp } from "../network.js";


const router = Router();

router.get("/api/qr", async (req, res) => {
  const url = `http://${getLocalIp()}:3000`;
  res.type("png");
  // Streams a PNG QR code directly in the HTTP response — no temp file needed
  QRCode.toFileStream(res, url, { width: 240, margin: 1 });
});

export default router;