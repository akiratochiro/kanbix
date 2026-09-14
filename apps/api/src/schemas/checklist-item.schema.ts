import { z } from "zod";

export const createChecklistItemSchema = z.object({
  text: z.string().trim().min(1, "O texto é obrigatório.").max(200),
});

export const updateChecklistItemSchema = z.object({
  text: z.string().trim().min(1, "O texto é obrigatório.").max(200).optional(),
  completed: z.boolean().optional(),
});

export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;
