"use client";

import { useQuery } from "@tanstack/react-query";
import { memberService } from "@/services/member.service";
import { memberKeys } from "@/lib/query-keys";

export function useMembers(workspaceId: string) {
  return useQuery({
    queryKey: memberKeys.listByWorkspace(workspaceId),
    queryFn: () => memberService.listByWorkspace(workspaceId),
    enabled: Boolean(workspaceId),
  });
}
