"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { labelService } from "@/services/label.service";
import { labelKeys } from "@/lib/query-keys";

export function useCreateLabel(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; color: string }) =>
      labelService.create(boardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.listByBoard(boardId) });
    },
  });
}
