"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace.service";
import { workspaceKeys } from "@/lib/query-keys";

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.create,
    onSuccess: () => {
      // A resposta do POST é um Workspace (sem `role`); a lista guarda
      // WorkspaceWithRole. Invalidar faz o servidor devolver a lista já
      // correta, em vez de a gente adivinhar o role no cliente.
      queryClient.invalidateQueries({ queryKey: workspaceKeys.list() });
    },
  });
}
