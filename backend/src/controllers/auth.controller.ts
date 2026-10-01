import type { Request, Response } from "express";

import {
  loginUser,
  registerUser,
} from "../services/auth.service";

import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator";

export async function register(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.flatten(),
      });
    }

    const result = await registerUser(parsed.data);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message:
        error instanceof Error ? error.message : "Registration failed",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.flatten(),
      });
    }

    const result = await loginUser(parsed.data);

    return res.json(result);
  } catch (error) {
    return res.status(401).json({
      message:
        error instanceof Error ? error.message : "Login failed",
    });
  }
}