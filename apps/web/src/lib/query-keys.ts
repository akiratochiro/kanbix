/**
 * Fábricas de query keys do TanStack Query.
 *
 * Centralizar as keys aqui evita divergência de strings (uma key digitada
 * diferente = um cache que nunca bate) e deixa a hierarquia explícita:
 * invalidar ["workspaces"] invalida também ["workspaces", "list"] e
 * ["workspaces", id].
 */

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const workspaceKeys = {
  all: ["workspaces"] as const,
  list: () => [...workspaceKeys.all, "list"] as const,
  detail: (id: string) => [...workspaceKeys.all, id] as const,
};
