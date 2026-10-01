import type { Request, Response } from "express";

import { chatWithAgent } from "../services/chat.service";
import { chatSchema } from "../validators/chat.validator";

export async function chat(req: Request, res: Response) {
  try {
    const parsed = chatSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.flatten(),
      });
    }

    const response = await chatWithAgent(
      parsed.data.message,
      req.user!.companyId,
      parsed.data.history
    );

    return res.json({
      response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to process chat",
    });
  }
}