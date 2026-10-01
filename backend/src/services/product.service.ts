import { Product } from "../models/Product";

type ProductInput = {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
};

export async function listProducts(companyId: string) {
  return Product.find({
    company_id: companyId,
  }).sort({ createdAt: -1 });
}

export async function getProductById(
  productId: string,
  companyId: string
) {
  return Product.findOne({
    _id: productId,
    company_id: companyId,
  });
}

export async function createProduct(
  input: ProductInput,
  companyId: string
) {
  return Product.create({
    ...input,
    company_id: companyId,
  });
}

export async function updateProduct(
  productId: string,
  input: Partial<ProductInput>,
  companyId: string
) {
  return Product.findOneAndUpdate(
    {
      _id: productId,
      company_id: companyId,
    },
    {
      $set: input,
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );
}

export async function deleteProduct(
  productId: string,
  companyId: string
) {
  return Product.findOneAndDelete({
    _id: productId,
    company_id: companyId,
  });
}