const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URL);

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    stock: Number,
  }),
);

app.get("/products", async (req, res) => {
  res.json(await Product.find());
});

app.get("/products/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

app.post("/products", async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

app.patch("/products/:id/stock", async (req, res) => {
  const { delta } = req.body; // e.g. -1 when an item is purchased
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { stock: delta } },
    { new: true },
  );
  res.json(product);
});

app.listen(3002, () => console.log("Product service running on 3002"));
