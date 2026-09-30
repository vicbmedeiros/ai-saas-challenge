import { Request, Response } from "express";
import { chatWithAgent } from "../services/chat.service";

export async function chat(req: Request, res: Response) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const response = await chatWithAgent(
      message,
      req.user!.companyId
    );

    return res.json({
      message: response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to process chat",
    });
  }
}