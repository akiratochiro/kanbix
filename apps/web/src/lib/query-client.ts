import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./api-client";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Por quanto tempo os dados são considerados "frescos".
        // Dentro dessa janela, o Query serve o cache sem refetch.
        staleTime: 30 * 1000,
        // Não refazer a requisição só porque a aba voltou ao foco.
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Erros 4xx são do cliente (não autorizado, não encontrado, etc.).
          // Repetir não adianta.
          if (error instanceof ApiError && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
