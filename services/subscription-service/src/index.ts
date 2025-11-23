import express from "express";
import { config } from "./config/app.config";
import connectionDatabase from "./database/db";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Subscription Service is running");
});

const PORT = config.PORT;
app.listen(PORT, async () => {
  connectionDatabase();
  console.log(`Content Service is running on port ${PORT}`);
});
