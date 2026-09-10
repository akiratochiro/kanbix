"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@kanbix/shared-types";
import { authService } from "@/services/auth.service";
import { authKeys } from "./query-keys";

const TOKEN_KEY = "kanbix_token";

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  // Começa `false` para bater com o HTML renderizado no servidor (sem
  // localStorage). O valor real é lido no efeito de montagem.
  const [hasToken, setHasToken] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setHasToken(readToken() !== null);
    setIsInitialized(true);
  }, []);

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: authService.getMe,
    // Sem token, `GET /me` é 401 garantido.
    enabled: isInitialized && hasToken,
    // A identidade do usuário não muda sozinha; revalidamos na mão
    // (ex.: após editar o perfil) via invalidateQueries.
    staleTime: Infinity,
    retry: false,
  });

  const login = useCallback(
    (token: string, user: User) => {
      localStorage.setItem(TOKEN_KEY, token);
      setHasToken(true);
      queryClient.setQueryData(authKeys.me(), user);
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setHasToken(false);
    queryClient.removeQueries({ queryKey: authKeys.me() });
  }, [queryClient]);

  // Token inválido ou expirado: o servidor respondeu erro, então limpamos.
  useEffect(() => {
    if (query.isError) {
      localStorage.removeItem(TOKEN_KEY);
      setHasToken(false);
    }
  }, [query.isError]);

  const isLoading = !isInitialized || (hasToken && query.isPending);

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
