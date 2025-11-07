import express from "express";
import passport from "passport";
import { config } from "./config/app.config";
import connectionDatabase from "./database/db";
import authRoutes from "./routes/auth.route";
import { errorHandler } from "./middlewares/globalError";
import { setupJwtStrategy } from "./shared/strategies/jwt.strategy";

const app = express();

app.use(express.json());

app.use(passport.initialize());
setupJwtStrategy(passport);

app.use("/", authRoutes);

app.use(errorHandler);

const PORT = config.PORT;
app.listen(PORT, async () => {
  connectionDatabase();
  console.log(`Auth Service is running on port ${PORT}`);
});
