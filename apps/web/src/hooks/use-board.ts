"use client";

import { useQuery } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";
import { boardKeys } from "@/lib/query-keys";

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => boardService.getById(boardId),
    enabled: Boolean(boardId),
  });
}
