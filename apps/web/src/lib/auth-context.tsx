"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@kanbix/shared-types";
import { apiClient, ApiError } from "./api-client";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("kanbix_token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    apiClient
      .get<User>("/me")
      .then(setUser)
      .catch((error) => {
        if (error instanceof ApiError) {
          localStorage.removeItem("kanbix_token");
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  function login(token: string, user: User) {
    localStorage.setItem("kanbix_token", token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("kanbix_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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