"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memberService, type AddMemberPayload } from "@/services/member.service";
import { memberKeys } from "@/lib/query-keys";

export function useAddMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddMemberPayload) => memberService.add(workspaceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberKeys.listByWorkspace(workspaceId),
      });
    },
  });
}
