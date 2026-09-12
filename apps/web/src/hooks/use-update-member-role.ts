"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { WorkspaceMember } from "@kanbix/shared-types";
import { memberService } from "@/services/member.service";
import { memberKeys } from "@/lib/query-keys";

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: WorkspaceMember["role"];
    }) => memberService.updateRole(workspaceId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.listByWorkspace(workspaceId),
      });
    },
  });
}
