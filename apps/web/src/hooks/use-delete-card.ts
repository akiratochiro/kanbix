"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService } from "@/services/card.service";
import { cardKeys } from "@/lib/query-keys";

export function useDeleteCard(cardId: string, listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cardService.remove(cardId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: cardKeys.detail(cardId) });
      queryClient.invalidateQueries({
        queryKey: cardKeys.listByList(listId),
      });
    },
  });
}
