const express = require("express");
const axios = require("axios");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.post("/orders", async (req, res) => {
  const { userId, items, totalAmount } = req.body;

  const orderResult = await pool.query(
    `INSERT INTO orders(user_id, status, total_amount) VALUES ($1,'PENDING',$2) RETURNING *`,
    [userId, totalAmount],
  );
  const order = orderResult.rows[0];

  try {
    await axios.post(`${process.env.PAYMENT_SERVICE_URL}/charge`, {
      orderId: order.id,
      amount: totalAmount,
    });
    await pool.query(`UPDATE orders SET status='PAID' WHERE id=$1`, [order.id]);

    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
      userId,
      type: "ORDER_CONFIRMATION",
      orderId: order.id,
    });

    res.status(201).json({ ...order, status: "PAID" });
  } catch (err) {
    await pool.query(`UPDATE orders SET status='FAILED' WHERE id=$1`, [
      order.id,
    ]);
    res.status(402).json({ error: "Payment failed", orderId: order.id });
  }
});

app.get("/orders/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM orders WHERE id=$1", [
    req.params.id,
  ]);
  res.json(result.rows[0]);
});

app.listen(3004, () => console.log("Order service running on 3004"));
