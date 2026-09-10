"use client";

import { useQuery } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";
import { boardKeys } from "@/lib/query-keys";

export function useBoards(workspaceId: string) {
  return useQuery({
    queryKey: boardKeys.listByWorkspace(workspaceId),
    queryFn: () => boardService.listByWorkspace(workspaceId),
    enabled: Boolean(workspaceId),
  });
}
