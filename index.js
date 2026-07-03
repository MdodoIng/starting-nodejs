import express from "express";

const app = express();
app.get("/", (req, res) => res.send("LAN share is running"));

// "0.0.0.0" = listen on every network interface, not just localhost
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
