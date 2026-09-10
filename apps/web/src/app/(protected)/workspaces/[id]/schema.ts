import { z } from "zod";

export const BOARD_COLORS = [
  { value: "#3B82F6", label: "Azul" },
  { value: "#8B5CF6", label: "Roxo" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#F97316", label: "Laranja" },
  { value: "#10B981", label: "Verde" },
  { value: "#64748B", label: "Cinza" },
] as const;

export const createBoardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(100, "O nome deve ter no máximo 100 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres."),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida."),
});

export type CreateBoardFormData = z.infer<typeof createBoardSchema>;
