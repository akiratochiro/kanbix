import { z } from "zod";

export const CARD_PRIORITIES = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
] as const;

export const UNASSIGNED = "UNASSIGNED";

export const cardDetailSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "O título é obrigatório.")
    .max(200, "O título deve ter no máximo 200 caracteres."),
  description: z
    .string()
    .trim()
    .max(2000, "A descrição deve ter no máximo 2000 caracteres."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string(),
  assigneeId: z.string(),
});

export type CardDetailFormData = z.infer<typeof cardDetailSchema>;

export function assigneeIdToPayload(value: string): string | null {
  return value === UNASSIGNED ? null : value;
}

export function assigneeIdFromCard(assigneeId: string | null): string {
  return assigneeId ?? UNASSIGNED;
}

/**
 * O input type="date" só lida com "YYYY-MM-DD". A API guarda a data-limite
 * como um instante (Prisma DateTime), então tratamos o dia escolhido como
 * meia-noite UTC — o mesmo fuso usado para exibir a data em `card-box.tsx`.
 */
export function dueDateToPayload(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

export function dueDateFromCard(dueDate: string | null): string {
  return dueDate ? dueDate.slice(0, 10) : "";
}
