import { NextFunction, Request, Response } from "express";
import { UserRole } from "../models/User";

export function requireRole(...roles: UserRole[]) {
  return function (
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    return next();
  };
}