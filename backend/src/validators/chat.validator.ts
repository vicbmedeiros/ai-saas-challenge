import { z } from "zod";

const historyMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(historyMessageSchema)
    .max(20)
    .optional()
    .default([]),
});

export type ChatHistoryMessage = z.infer<
  typeof historyMessageSchema
>;