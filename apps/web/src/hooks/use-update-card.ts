"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService, type UpdateCardPayload } from "@/services/card.service";
import { cardKeys } from "@/lib/query-keys";

export function useUpdateCard(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCardPayload) =>
      cardService.update(cardId, payload),
    onSuccess: (card) => {
      queryClient.setQueryData(cardKeys.detail(cardId), card);
      queryClient.invalidateQueries({
        queryKey: cardKeys.listByList(card.listId),
      });
    },
  });
}
