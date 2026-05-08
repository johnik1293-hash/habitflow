import { NextFunction, Request, Response } from "express";

export function requireBodyFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing = fields.filter((field) => req.body?.[field] === undefined || req.body?.[field] === "");
    if (missing.length) {
      res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
      return;
    }
    next();
  };
}

