"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService, type CreateCardPayload } from "@/services/card.service";
import { cardKeys } from "@/lib/query-keys";

export function useCreateCard(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCardPayload) =>
      cardService.create(listId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cardKeys.listByList(listId),
      });
    },
  });
}
