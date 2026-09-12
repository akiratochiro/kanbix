import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
