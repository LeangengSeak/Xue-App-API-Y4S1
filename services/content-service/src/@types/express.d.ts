import "express";

declare global {
  namespace Express {
    interface User {
      id?: string;
      [key: string]: any;
    }
    // augment Request to include user and sessionId used across the codebase
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

export {};
