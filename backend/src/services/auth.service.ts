import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { Company } from "../models/Company";
import { User } from "../models/User";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  companyName: string;
};

type LoginInput = {
  email: string;
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function signToken(user: any) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      companyId: user.company_id.toString(),
      role: user.role,
    },
    secret,
    {
      expiresIn: "8h",
    }
  );
}

export async function registerUser(
  input: RegisterInput
) {
  const email = normalizeEmail(input.email);

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const company = await Company.create({
    name: input.companyName,
  });

  const passwordHash = await bcrypt.hash(
    input.password,
    12
  );

  const user = await User.create({
    name: input.name,
    email,
    passwordHash,
    role: "admin",
    company_id: company._id,
  });

  return {
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
    },
  };
}

export async function loginUser(
  input: LoginInput
) {
  const email = normalizeEmail(input.email);

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const validPassword = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  return {
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.company_id,
    },
  };
}