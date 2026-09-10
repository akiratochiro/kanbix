"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService, type CreateBoardPayload } from "@/services/board.service";
import { boardKeys } from "@/lib/query-keys";

export function useCreateBoard(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBoardPayload) =>
      boardService.create(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.listByWorkspace(workspaceId),
      });
    },
  });
}
