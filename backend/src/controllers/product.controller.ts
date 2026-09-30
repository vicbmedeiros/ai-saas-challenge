import { Request, Response } from "express";

import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../services/product.service";

export async function list(req: Request, res: Response) {
  const products = await listProducts(req.user!.companyId);

  return res.json(products);
}

export async function getById(req: Request, res: Response) {
  const product = await getProductById(
    req.params.id,
    req.user!.companyId
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  return res.json(product);
}

export async function create(req: Request, res: Response) {
  const product = await createProduct(
    req.body,
    req.user!.companyId
  );

  return res.status(201).json(product);
}

export async function update(req: Request, res: Response) {
  const product = await updateProduct(
    req.params.id,
    req.body,
    req.user!.companyId
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  return res.json(product);
}

export async function remove(req: Request, res: Response) {
  const product = await deleteProduct(
    req.params.id,
    req.user!.companyId
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  return res.status(204).send();
}