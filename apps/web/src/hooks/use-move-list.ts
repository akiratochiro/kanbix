"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { arrayMove } from "@dnd-kit/sortable";
import type { List } from "@kanbix/shared-types";
import { listService } from "@/services/list.service";
import { listKeys } from "@/lib/query-keys";

export interface MoveListVars {
  listId: string;
  toIndex: number;
}

interface MoveContext {
  boardId: string;
  snapshot: List[];
}

export function useMoveList(boardId: string) {
  const queryClient = useQueryClient();
  const key = listKeys.listByBoard(boardId);

  return useMutation({
    mutationFn: ({ listId, toIndex }: MoveListVars) =>
      listService.move(listId, toIndex),

    // Optimistic: reordena o cache das listas do board na hora.
    onMutate: async ({ listId, toIndex }): Promise<MoveContext> => {
      await queryClient.cancelQueries({ queryKey: key });

      const snapshot = queryClient.getQueryData<List[]>(key) ?? [];
      const fromIndex = snapshot.findIndex((list) => list.id === listId);
      if (fromIndex !== -1) {
        queryClient.setQueryData(key, arrayMove(snapshot, fromIndex, toIndex));
      }

      return { boardId, snapshot };
    },

    onError: (_error, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(key, context.snapshot);
    },

    // Reconcilia com as positions reais do servidor.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
