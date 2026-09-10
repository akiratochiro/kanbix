"use client";

import { useQuery } from "@tanstack/react-query";
import { cardService } from "@/services/card.service";
import { cardKeys } from "@/lib/query-keys";

export function useCards(listId: string) {
  return useQuery({
    queryKey: cardKeys.listByList(listId),
    queryFn: () => cardService.listByList(listId),
    enabled: Boolean(listId),
  });
}
