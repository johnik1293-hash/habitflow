import { Request, Response } from "express";

export function requireUserId(req: Request, res: Response): number | null {
  const userIdHeader = req.header("x-user-id");
  const userId = Number(userIdHeader);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(401).json({ error: "x-user-id header is required" });
    return null;
  }
  return userId;
}

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

