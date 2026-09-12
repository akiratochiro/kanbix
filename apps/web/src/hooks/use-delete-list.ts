"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { listService } from "@/services/list.service";
import { listKeys } from "@/lib/query-keys";

export function useDeleteList(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) => listService.remove(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: listKeys.listByBoard(boardId),
      });
    },
  });
}
