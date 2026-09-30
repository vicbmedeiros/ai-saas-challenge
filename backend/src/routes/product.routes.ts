import { Router } from "express";

import {
  create,
  getById,
  list,
  remove,
  update,
} from "../controllers/product.controller";

import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

export const productRouter = Router();

productRouter.use(authMiddleware);

productRouter.get("/", list);
productRouter.get("/:id", getById);

productRouter.post(
  "/",
  requireRole("admin"),
  create
);

productRouter.put(
  "/:id",
  requireRole("admin"),
  update
);

productRouter.delete(
  "/:id",
  requireRole("admin"),
  remove
);