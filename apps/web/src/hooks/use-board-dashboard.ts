"use client";

import { useQuery } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";
import { boardKeys } from "@/lib/query-keys";

export function useBoardDashboard(boardId: string) {
  return useQuery({
    queryKey: boardKeys.dashboard(boardId),
    queryFn: () => boardService.getDashboard(boardId),
    enabled: Boolean(boardId),
  });
}
