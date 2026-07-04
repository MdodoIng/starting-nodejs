import express from "express";
import { db } from "./db.js";

const app = express();
app.use(express.json());

app.listen(3000, () => console.log("Server on http://localhost:3000"));
