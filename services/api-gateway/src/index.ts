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

app.use(`${API_VERSION}/auth`, createServiceProxy(AUTH_SERVICE_URL));
app.use(`${API_VERSION}/user`, createServiceProxy(USER_SERVICE_URL));
app.use(
  `${API_VERSION}/content`,
  createServiceProxy(config.SERVICE.CONTENT_URL)
);
app.use(`${API_VERSION}/read`, createServiceProxy(config.SERVICE.READ_URL));
app.use(
  `${API_VERSION}/subscription`,
  createServiceProxy(config.SERVICE.SUBSCRIPTION_URL)
);
// app.use(
//   `${API_VERSION}/payment`,
//   createServiceProxy(config.SERVICE.PAYMENT_URL)
// );

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
