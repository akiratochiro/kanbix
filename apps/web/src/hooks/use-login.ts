"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/lib/auth-context";
import { authKeys } from "@/lib/query-keys";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { login } = useAuth();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ token, user }) => {
      // Persiste o token e atualiza o estado do AuthContext.
      login(token, user);
      // A resposta já traz o usuário: grava no cache para o AuthContext
      // (que passará a usar useQuery) não disparar um GET /me redundante.
      queryClient.setQueryData(authKeys.me(), user);
      router.push("/workspaces");
    },
  });
}
