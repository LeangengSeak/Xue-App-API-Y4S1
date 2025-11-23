import "express";

declare global {
  namespace Express {
    interface User {
      id?: string;
      [key: string]: any;
    }

    interface Request {
      sessionId?: string;
    }
  }
}

export {};
