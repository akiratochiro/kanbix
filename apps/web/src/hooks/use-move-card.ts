"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Card } from "@kanbix/shared-types";
import { cardService } from "@/services/card.service";
import { cardKeys } from "@/lib/query-keys";

export interface MoveCardVars {
  cardId: string;
  fromListId: string;
  toListId: string;
  toIndex: number;
}

interface MoveContext {
  fromListId: string;
  toListId: string;
  fromSnapshot: Card[];
  toSnapshot: Card[];
}

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, toListId, toIndex }: MoveCardVars) =>
      cardService.move(cardId, { toListId, toIndex }),

    // Optimistic: mexe nos caches das listas de origem e destino na hora.
    onMutate: async ({
      cardId,
      fromListId,
      toListId,
      toIndex,
    }): Promise<MoveContext> => {
      await queryClient.cancelQueries({ queryKey: cardKeys.all });

      const fromKey = cardKeys.listByList(fromListId);
      const toKey = cardKeys.listByList(toListId);
      const fromSnapshot = queryClient.getQueryData<Card[]>(fromKey) ?? [];
      const toSnapshot = queryClient.getQueryData<Card[]>(toKey) ?? [];

      const nextFrom = [...fromSnapshot];
      const currentIndex = nextFrom.findIndex((card) => card.id === cardId);
      if (currentIndex === -1) {
        return { fromListId, toListId, fromSnapshot, toSnapshot };
      }
      const [moved] = nextFrom.splice(currentIndex, 1);

      if (fromListId === toListId) {
        nextFrom.splice(toIndex, 0, moved);
        queryClient.setQueryData(fromKey, nextFrom);
      } else {
        const nextTo = [...toSnapshot];
        nextTo.splice(toIndex, 0, { ...moved, listId: toListId });
        queryClient.setQueryData(fromKey, nextFrom);
        queryClient.setQueryData(toKey, nextTo);
      }

      return { fromListId, toListId, fromSnapshot, toSnapshot };
    },

    onError: (_error, _vars, context) => {
      if (!context) return;
      queryClient.setQueryData(
        cardKeys.listByList(context.fromListId),
        context.fromSnapshot
      );
      queryClient.setQueryData(
        cardKeys.listByList(context.toListId),
        context.toSnapshot
      );
    },

    // Reconcilia com o servidor (posições reais) das duas listas.
    onSettled: (_data, _error, { fromListId, toListId }) => {
      queryClient.invalidateQueries({
        queryKey: cardKeys.listByList(fromListId),
      });
      queryClient.invalidateQueries({
        queryKey: cardKeys.listByList(toListId),
      });
    },
  });
}
