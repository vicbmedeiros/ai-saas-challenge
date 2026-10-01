import type { Request, Response } from "express";
import mongoose from "mongoose";

import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../services/product.service";

import {
  productSchema,
  productUpdateSchema,
} from "../validators/product.validator";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function list(req: Request, res: Response) {
  try {
    const products = await listProducts(req.user!.companyId);

    return res.json(products);
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to list products",
    });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const productId = req.params.id;

    if (
      typeof productId !== "string" ||
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await getProductById(
      productId,
      req.user!.companyId
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to get product",
    });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const parsed = productSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.flatten(),
      });
    }

    const product = await createProduct(
      parsed.data,
      req.user!.companyId
    );

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to create product",
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const productId = req.params.id;

    if (
      typeof productId !== "string" ||
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const parsed = productUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.flatten(),
      });
    }

    const product = await updateProduct(
      productId,
      parsed.data,
      req.user!.companyId
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to update product",
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const productId = req.params.id;

    if (
      typeof productId !== "string" ||
      !isValidObjectId(productId)
    ) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await deleteProduct(
      productId,
      req.user!.companyId
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "Failed to delete product",
    });
  }
}