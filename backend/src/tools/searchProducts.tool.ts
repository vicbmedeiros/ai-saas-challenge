import { z } from "zod";

import { Product } from "../models/Product";

const searchProductsSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
});

export type SearchProductsInput = z.infer<
  typeof searchProductsSchema
>;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseSearchProductsInput(input: unknown) {
  return searchProductsSchema.safeParse(input);
}

export async function searchProducts(
  input: SearchProductsInput,
  companyId: string
) {
  const query: Record<string, any> = {
    company_id: companyId,
  };

  if (input.search) {
    const safeSearch = escapeRegex(input.search);

    query.$or = [
      {
        name: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        description: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ];
  }

  if (input.category) {
    const safeCategory = escapeRegex(input.category);

    query.category = {
      $regex: `^${safeCategory}$`,
      $options: "i",
    };
  }

  if (
    input.minPrice !== undefined ||
    input.maxPrice !== undefined
  ) {
    query.price = {};

    if (input.minPrice !== undefined) {
      query.price.$gte = input.minPrice;
    }

    if (input.maxPrice !== undefined) {
      query.price.$lte = input.maxPrice;
    }
  }

  return Product.find(query)
    .select("name description price category imageUrl")
    .limit(20)
    .lean();
}