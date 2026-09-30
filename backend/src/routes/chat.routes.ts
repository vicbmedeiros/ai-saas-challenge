import { Router } from "express";

import { chat } from "../controllers/chat.controller";
import { authMiddleware } from "../middleware/auth";

export const chatRouter = Router();

chatRouter.post("/", authMiddleware, chat);