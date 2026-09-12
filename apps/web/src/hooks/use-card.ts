"use client";

import { useQuery } from "@tanstack/react-query";
import { cardService } from "@/services/card.service";
import { cardKeys } from "@/lib/query-keys";

export function useCard(cardId: string) {
  return useQuery({
    queryKey: cardKeys.detail(cardId),
    queryFn: () => cardService.getById(cardId),
    enabled: Boolean(cardId),
  });
}
