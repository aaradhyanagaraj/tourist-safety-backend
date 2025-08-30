const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (_req, res) => res.json({ message: "JS backend alive 🚀" }));

module.exports = { app };
