import express from "express";
import { config } from "./config/app.config";
import connectionDatabase from "./database/db";
import userRoutes from "./routes/user.route";
import { errorHandler } from "./middlewares/globalError";

const app = express();

app.use(express.json());

// Token validation is delegated to auth-service via requireAuth middleware.

app.use("/", userRoutes);

app.use(errorHandler);

const PORT = config.PORT;
app.listen(PORT, async () => {
  connectionDatabase();
  console.log(`User Service is running on port ${PORT}`);
});
