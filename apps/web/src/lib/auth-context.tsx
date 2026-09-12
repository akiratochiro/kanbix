"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@kanbix/shared-types";
import { ApiError } from "./api-client";
import { authService } from "@/services/auth.service";
import { authKeys } from "./query-keys";
import { tokenStore } from "./token-store";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function subscribeNever() {
  return () => {};
}

/**
 * `false` na primeira renderização do cliente (igual ao servidor, sem
 * mismatch de hidratação) e `true` a partir da própria correção que o
 * React já faz para `useSyncExternalStore` logo em seguida. Serve pra
 * saber se o `token` abaixo já é definitivo ou ainda pode ser o eco
 * (sempre `null`) do `getServerSnapshot`.
 */
function useIsHydrated() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const isHydrated = useIsHydrated();

  const token = useSyncExternalStore(
    tokenStore.subscribe,
    tokenStore.getSnapshot,
    tokenStore.getServerSnapshot
  );

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        return await authService.getMe();
      } catch (error) {
        // Token inválido/expirado: descarta para não ficar tentando.
        if (error instanceof ApiError && error.status === 401) {
          tokenStore.clear();
        }
        throw error;
      }
    },
    // Sem token, GET /me é 401 garantido.
    enabled: token !== null,
    // A identidade do usuário não muda sozinha; revalidamos na mão.
    staleTime: Infinity,
    retry: false,
  });

  const login = useCallback(
    (nextToken: string, user: User) => {
      tokenStore.set(nextToken);
      queryClient.setQueryData(authKeys.me(), user);
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    queryClient.removeQueries({ queryKey: authKeys.me() });
  }, [queryClient]);

  // Enquanto não hidratou de verdade, `token` pode ainda ser o eco do
  // getServerSnapshot (sempre null) — não dá pra confiar que "sem token"
  // já significa "deslogado" nesse instante.
  const isLoading = !isHydrated || (token !== null && query.isPending);

  return (
    <AuthContext.Provider
      value={{ user: query.data ?? null, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider.");
  }

  return context;
}
