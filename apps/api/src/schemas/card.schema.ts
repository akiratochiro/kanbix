import { z } from "zod";

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createCardSchema = z.object({
  title: z.string().trim().min(1, "O título é obrigatório.").max(200),
  description: z.string().trim().max(2000).optional(),
  priority: priorityEnum.optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().uuid().optional(),
});

export const updateCardSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  priority: priorityEnum.optional(),
  dueDate: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  listId: z.string().uuid().optional(),
});

export const moveCardSchema = z.object({
  toListId: z.string().uuid(),
  toIndex: z.number().int().min(0),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;