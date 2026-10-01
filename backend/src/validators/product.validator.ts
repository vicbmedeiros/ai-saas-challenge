import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.number().nonnegative(),
  category: z.string().min(1),
  imageUrl: z.string().url(),
});

export const productUpdateSchema = productSchema.partial();