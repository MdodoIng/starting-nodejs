const express = require("express");
const { createClient } = require("redis");
require("dotenv").config();

const app = express();
app.use(express.json());

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect();

app.get("/cart/:userId", async (req, res) => {
  const cart = await redisClient.get(`cart:${req.params.userId}`);
  res.json(cart ? JSON.parse(cart) : { items: [] });
});

app.post("/cart/:userId/items", async (req, res) => {
  const key = `cart:${req.params.userId}`;
  const existing = JSON.parse((await redisClient.get(key)) || '{"items":[]}');
  existing.items.push(req.body);
  await redisClient.set(key, JSON.stringify(existing));
  res.status(201).json(existing);
});

app.delete("/cart/:userId", async (req, res) => {
  await redisClient.del(`cart:${req.params.userId}`);
  res.status(204).send();
});

app.listen(3003, () => console.log("Cart service running on 3003"));
