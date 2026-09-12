import { z } from "zod";

export const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
