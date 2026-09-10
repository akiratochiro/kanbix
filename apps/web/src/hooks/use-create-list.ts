"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listService } from "@/services/list.service";
import { listKeys } from "@/lib/query-keys";

export function useCreateList(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => listService.create(boardId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: listKeys.listByBoard(boardId),
      });
    },
  });
}
