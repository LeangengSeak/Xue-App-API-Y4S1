import "express";

declare global {
  namespace Express {
    interface User {
      id?: string;
      [key: string]: any;
    }
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

export {};
