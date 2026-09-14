import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createLabelSchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório.").max(50),
  color: z
    .string()
    .regex(hexColorRegex, "A cor deve estar no formato hexadecimal, ex: #3B82F6."),
});

export const updateLabelSchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório.").max(50).optional(),
  color: z
    .string()
    .regex(hexColorRegex, "A cor deve estar no formato hexadecimal, ex: #3B82F6.")
    .optional(),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
