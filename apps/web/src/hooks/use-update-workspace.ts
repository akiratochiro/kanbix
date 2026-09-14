"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  workspaceService,
  type CreateWorkspacePayload,
} from "@/services/workspace.service";
import { workspaceKeys } from "@/lib/query-keys";

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkspacePayload) =>
      workspaceService.update(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
  });
}
