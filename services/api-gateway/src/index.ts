import express from "express";
import createServiceProxy from "./middlewares/proxy";
import { config } from "./config/app.config";

const app = express();

const API_VERSION = config.BASE_PATH;

const AUTH_SERVICE_URL = config.SERVICE.AUTH_URL;
const USER_SERVICE_URL = config.SERVICE.USER_URL;

app.get("/", (req, res) => {
  res.send("API Gateway running");
});

// Mount typed proxy middlewares from ./proxy
app.use(`${API_VERSION}/auth`, createServiceProxy(AUTH_SERVICE_URL));
app.use(`${API_VERSION}/users`, createServiceProxy(USER_SERVICE_URL));

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
