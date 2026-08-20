import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .optional(),
  color: z
    .string()
    .regex(hexColorRegex, "A cor deve estar no formato hexadecimal, ex: #3B82F6.")
    .optional(),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;