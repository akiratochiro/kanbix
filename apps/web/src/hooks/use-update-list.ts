"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { List } from "@kanbix/shared-types";
import { listService } from "@/services/list.service";
import { listKeys } from "@/lib/query-keys";

export interface UpdateListVars {
  listId: string;
  name: string;
}

interface UpdateContext {
  snapshot: List[];
}

export function useUpdateList(boardId: string) {
  const queryClient = useQueryClient();
  const key = listKeys.listByBoard(boardId);

  return useMutation({
    mutationFn: ({ listId, name }: UpdateListVars) =>
      listService.update(listId, name),

    // Optimistic: já mostra o novo nome, sem esperar a resposta do servidor.
    onMutate: async ({ listId, name }): Promise<UpdateContext> => {
      await queryClient.cancelQueries({ queryKey: key });

      const snapshot = queryClient.getQueryData<List[]>(key) ?? [];
      queryClient.setQueryData(
        key,
        snapshot.map((list) => (list.id === listId ? { ...list, name } : list))
      );

      return { snapshot };
    },

    onError: (_error, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(key, context.snapshot);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
