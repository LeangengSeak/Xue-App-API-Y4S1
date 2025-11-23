import { HTTPSTATUS } from "../../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    public errorCode?: ErrorCode
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
