"use client";

import { useQuery } from "@tanstack/react-query";
import { listService } from "@/services/list.service";
import { listKeys } from "@/lib/query-keys";

export function useLists(boardId: string) {
  return useQuery({
    queryKey: listKeys.listByBoard(boardId),
    queryFn: () => listService.listByBoard(boardId),
    enabled: Boolean(boardId),
  });
}
