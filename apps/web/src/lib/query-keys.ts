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

export const boardKeys = {
  all: ["boards"] as const,
  listByWorkspace: (workspaceId: string) =>
    [...boardKeys.all, "workspace", workspaceId] as const,
  detail: (boardId: string) => [...boardKeys.all, boardId] as const,
};

export const listKeys = {
  all: ["lists"] as const,
  listByBoard: (boardId: string) =>
    [...listKeys.all, "board", boardId] as const,
};

export const cardKeys = {
  all: ["cards"] as const,
  listByList: (listId: string) => [...cardKeys.all, "list", listId] as const,
  detail: (cardId: string) => [...cardKeys.all, cardId] as const,
};
