"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checklistItemService } from "@/services/checklist-item.service";
import { cardKeys, checklistItemKeys } from "@/lib/query-keys";

export interface UpdateChecklistItemVars {
  itemId: string;
  text?: string;
  completed?: boolean;
}

export function useUpdateChecklistItem(cardId: string, listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, ...payload }: UpdateChecklistItemVars) =>
      checklistItemService.update(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: checklistItemKeys.listByCard(cardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.listByList(listId) });
    },
  });
}
