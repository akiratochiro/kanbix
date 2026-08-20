import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().trim().min(1, "O nome é obrigatório.").max(100),
});

export type CreateListInput = z.infer<typeof createListSchema>;