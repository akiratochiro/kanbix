import { prisma } from "../config/prisma";
import type { User as PrismaUser } from "@prisma/client";

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export const userRepository = {
  async create(data: CreateUserData): Promise<PrismaUser> {
    return prisma.user.create({ data });
  },

  async findByEmail(email: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({ where: { id } });
  },
};