import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { EmailAlreadyInUseError } from "../utils/errors";
import type { User } from "@kanbix/shared-types";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;

function toDTO(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
}): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

export const userService = {
  async createUser(input: CreateUserInput): Promise<User> {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new EmailAlreadyInUseError(input.email);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const createdUser = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return toDTO(createdUser);
  },
};