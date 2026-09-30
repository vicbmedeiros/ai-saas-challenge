import { Product } from "../models/Product";

type SearchProductsInput = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function searchProducts(
  input: SearchProductsInput,
  companyId: string
) {
  const query: any = {
    company_id: companyId,
  };

  if (input.search) {
    query.$or = [
      { name: { $regex: input.search, $options: "i" } },
      { description: { $regex: input.search, $options: "i" } },
    ];
  }

  if (input.category) {
    query.category = {
      $regex: `^${input.category}$`,
      $options: "i",
    };
  }

  if (input.minPrice !== undefined || input.maxPrice !== undefined) {
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