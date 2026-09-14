"use client";

import { useQuery } from "@tanstack/react-query";
import { checklistItemService } from "@/services/checklist-item.service";
import { checklistItemKeys } from "@/lib/query-keys";

export function useChecklistItems(cardId: string) {
  return useQuery({
    queryKey: checklistItemKeys.listByCard(cardId),
    queryFn: () => checklistItemService.listByCard(cardId),
    enabled: Boolean(cardId),
  });
}
