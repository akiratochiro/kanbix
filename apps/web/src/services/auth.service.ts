import type { User } from "@kanbix/shared-types";
import { apiClient } from "@/lib/api-client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Funções puras de acesso à API de autenticação.
 * Não conhecem React nem cache — quem orquestra isso são os hooks.
 */
export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>("/login", credentials),

  register: (payload: RegisterPayload) =>
    apiClient.post<User>("/users", payload),

  getMe: () => apiClient.get<User>("/me"),
};
