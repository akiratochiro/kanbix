import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório.").max(100),
});

export const moveListSchema = z.object({
  toIndex: z.number().int().min(0),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type MoveListInput = z.infer<typeof moveListSchema>;