"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checklistItemService } from "@/services/checklist-item.service";
import { cardKeys, checklistItemKeys } from "@/lib/query-keys";

export function useCreateChecklistItem(cardId: string, listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => checklistItemService.create(cardId, text),
    onSuccess: () => {
      // O item em si não muda o card, mas o resumo `checklist` {total,
      // completed} que o card carrega precisa ser recalculado.
      queryClient.invalidateQueries({ queryKey: checklistItemKeys.listByCard(cardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.listByList(listId) });
    },
  });
}
