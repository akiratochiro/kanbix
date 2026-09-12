"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "@/services/board.service";
import { boardKeys } from "@/lib/query-keys";

export function useDeleteBoard(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) => boardService.remove(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.listByWorkspace(workspaceId),
      });
    },
  });
}
