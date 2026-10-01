import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { Company } from "../models/Company";
import { Product } from "../models/Product";
import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "../services/product.service";
import { searchProducts } from "../tools/searchProducts.tool";

let mongoServer: MongoMemoryServer;

describe("Multi-tenant isolation", () => {
  let companyAId: string;
  let companyBId: string;
  let productAId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      Company.deleteMany({}),
      Product.deleteMany({}),
    ]);

    const companyA = await Company.create({
      name: "Company A",
    });

    const companyB = await Company.create({
      name: "Company B",
    });

    companyAId = companyA._id.toString();
    companyBId = companyB._id.toString();

    const productA = await Product.create({
      name: "Product A",
      description: "Private product from Company A",
      price: 100,
      category: "Test",
      imageUrl: "https://example.com/product-a.jpg",
      company_id: companyAId,
    });

    await Product.create({
      name: "Product B",
      description: "Private product from Company B",
      price: 200,
      category: "Test",
      imageUrl: "https://example.com/product-b.jpg",
      company_id: companyBId,
    });

    productAId = productA._id.toString();
  });

  it("does not allow Company B to read a Company A product", async () => {
    const product = await getProductById(
      productAId,
      companyBId
    );

    expect(product).toBeNull();
  });

  it("does not allow Company B to update a Company A product", async () => {
    const product = await updateProduct(
      productAId,
      {
        name: "Hacked product",
      },
      companyBId
    );

    expect(product).toBeNull();

    const originalProduct = await Product.findById(productAId);

    expect(originalProduct?.name).toBe("Product A");
  });

  it("does not allow Company B to delete a Company A product", async () => {
    const product = await deleteProduct(
      productAId,
      companyBId
    );

    expect(product).toBeNull();

    const originalProduct = await Product.findById(productAId);

    expect(originalProduct).not.toBeNull();
  });

  it("searchProducts only returns products from the authenticated company", async () => {
    const resultsA = await searchProducts({}, companyAId);
  
    expect(resultsA).toHaveLength(1);
    expect(resultsA[0]?.name).toBe("Product A");
  
    const namesA = resultsA.map((product) => product.name);
  
    expect(namesA).toContain("Product A");
    expect(namesA).not.toContain("Product B");
  
    const resultsB = await searchProducts({}, companyBId);
  
    expect(resultsB).toHaveLength(1);
    expect(resultsB[0]?.name).toBe("Product B");
  
    const namesB = resultsB.map((product) => product.name);
  
    expect(namesB).toContain("Product B");
    expect(namesB).not.toContain("Product A");
  });
});