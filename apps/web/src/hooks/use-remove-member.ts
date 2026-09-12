"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberService } from "@/services/member.service";
import { memberKeys } from "@/lib/query-keys";

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => memberService.remove(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.listByWorkspace(workspaceId),
      });
    },
  });
}
