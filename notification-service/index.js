const express = require("express");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const app = express();
app.use(express.json());
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post("/notify", async (req, res) => {
  const { userId, type, orderId } = req.body;
  const messages = {
    ORDER_CONFIRMATION: `Your order #${orderId} has been confirmed!`,
    SHIPPING_UPDATE: `Your order #${orderId} has shipped!`,
  };

  await sgMail.send({
    to: `user-${userId}@example.com`, // resolve real email via user-service in practice
    from: "orders@yourshop.com",
    subject: type.replace("_", " "),
    text: messages[type] || "Update on your order.",
  });

  res.status(202).json({ sent: true });
});

app.listen(3006, () => console.log("Notification service running on 3006"));
