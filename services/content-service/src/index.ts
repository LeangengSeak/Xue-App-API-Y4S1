import express from "express";
import fileUpload from "express-fileupload";
import path from "path";
import { config } from "./config/app.config";
import connectionDatabase from "./database/db";
import contentRoutes from "./routes/content.route";
import { errorHandler } from "./middlewares/globalError";

const app = express();

app.use(express.json());

// file upload middleware (express-fileupload) - uses temp files
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "tmp"),
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 },
  })
);

// No JWT setup here; admin endpoints are protected via admin API key in this service.

app.use("/", contentRoutes);

app.use(errorHandler);

const PORT = config.PORT;
app.listen(PORT, async () => {
  connectionDatabase();
  console.log(`Content Service is running on port ${PORT}`);
});
