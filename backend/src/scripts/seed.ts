import "dotenv/config";
import bcrypt from "bcryptjs";

import { connectDatabase } from "../config/database";
import { Company } from "../models/Company";
import { User } from "../models/User";
import { Product } from "../models/Product";

async function seed() {
  await connectDatabase();

  await Promise.all([
    Company.deleteMany({}),
    User.deleteMany({}),
    Product.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("123456", 12);

  const techStore = await Company.create({
    name: "Tech Store",
  });

  const beautyStore = await Company.create({
    name: "Beauty Store",
  });

  await User.create([
    {
      name: "Admin Tech",
      email: "admin@techstore.com",
      passwordHash,
      role: "admin",
      company_id: techStore._id,
    },
    {
      name: "User Tech",
      email: "user@techstore.com",
      passwordHash,
      role: "user",
      company_id: techStore._id,
    },
    {
      name: "Admin Beauty",
      email: "admin@beautystore.com",
      passwordHash,
      role: "admin",
      company_id: beautyStore._id,
    },
    {
      name: "User Beauty",
      email: "user@beautystore.com",
      passwordHash,
      role: "user",
      company_id: beautyStore._id,
    },
  ]);

  const techProducts = Array.from({ length: 10 }).map((_, index) => ({
    name: `Tech Product ${index + 1}`,
    description: `Produto de tecnologia ${index + 1}`,
    price: 100 + index * 50,
    category: index % 2 === 0 ? "Acessórios" : "Periféricos",
    imageUrl: `https://picsum.photos/seed/tech-${index + 1}/400/300`,
    company_id: techStore._id,
  }));

  const beautyProducts = Array.from({ length: 10 }).map((_, index) => ({
    name: `Beauty Product ${index + 1}`,
    description: `Produto de beleza ${index + 1}`,
    price: 50 + index * 20,
    category: index % 2 === 0 ? "Skincare" : "Maquiagem",
    imageUrl: `https://picsum.photos/seed/beauty-${index + 1}/400/300`,
    company_id: beautyStore._id,
  }));

  await Product.insertMany([
    ...techProducts,
    ...beautyProducts,
  ]);

  console.log("Seed completed");
  console.log("admin@techstore.com / 123456");
  console.log("user@techstore.com / 123456");
  console.log("admin@beautystore.com / 123456");
  console.log("user@beautystore.com / 123456");

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});