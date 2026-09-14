"use client";

import { useQuery } from "@tanstack/react-query";
import { labelService } from "@/services/label.service";
import { labelKeys } from "@/lib/query-keys";

export function useLabels(boardId: string) {
  return useQuery({
    queryKey: labelKeys.listByBoard(boardId),
    queryFn: () => labelService.listByBoard(boardId),
    enabled: Boolean(boardId),
  });
}
