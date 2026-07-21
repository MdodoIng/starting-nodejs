const express = require("express");
const Stripe = require("stripe");
require("dotenv").config();

const app = express();
app.use(express.json());
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/charge", async (req, res) => {
  const { orderId, amount } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      metadata: { orderId },
    });
    res.json({ success: true, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(402).json({ success: false, error: err.message });
  }
});

app.listen(3005, () => console.log("Payment service running on 3005"));
