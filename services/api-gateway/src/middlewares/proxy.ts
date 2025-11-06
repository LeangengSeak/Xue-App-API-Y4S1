import { RequestHandler } from "express";
import proxy from "express-http-proxy";

export const createServiceProxy = (targetUrl: string): RequestHandler => {
  return proxy(targetUrl, {
    proxyReqOptDecorator(proxyReqOpts, srcReq) {
      if (srcReq.headers.authorization) {
        proxyReqOpts.headers = proxyReqOpts.headers || {};
        proxyReqOpts.headers["authorization"] = srcReq.headers
          .authorization as string;
      }
      return proxyReqOpts;
    },
    proxyErrorHandler(err, res, next) {
      console.error(
        "Proxy error when forwarding to",
        targetUrl,
        err && err.message
      );
      next(err);
    },
  });
};

export default createServiceProxy;
