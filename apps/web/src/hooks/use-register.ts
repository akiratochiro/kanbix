"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, type RegisterPayload } from "@/services/auth.service";
import { useAuth } from "@/lib/auth-context";
import { authKeys } from "@/lib/query-keys";

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { login } = useAuth();

  return useMutation({
    // Cadastra e já autentica: POST /users não devolve token, então
    // encadeamos um login com as mesmas credenciais.
    mutationFn: async (payload: RegisterPayload) => {
      await authService.register(payload);
      return authService.login({
        email: payload.email,
        password: payload.password,
      });
    },
    onSuccess: ({ token, user }) => {
      login(token, user);
      queryClient.setQueryData(authKeys.me(), user);
      router.push("/workspaces");
    },
  });
}
