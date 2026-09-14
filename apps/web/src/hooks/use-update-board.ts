"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService, type CreateBoardPayload } from "@/services/board.service";
import { boardKeys } from "@/lib/query-keys";

export function useUpdateBoard(boardId: string, workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBoardPayload) =>
      boardService.update(boardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({
        queryKey: boardKeys.listByWorkspace(workspaceId),
      });
    },
  });
}
