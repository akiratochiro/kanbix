"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService } from "@/services/card.service";
import { cardKeys } from "@/lib/query-keys";

export function useAddCardLabel(cardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => cardService.addLabel(cardId, labelId),
    onSuccess: (card) => {
      queryClient.setQueryData(cardKeys.detail(cardId), card);
      queryClient.invalidateQueries({ queryKey: cardKeys.listByList(card.listId) });
    },
  });
}
