"use client";

import { useQuery } from "@tanstack/react-query";
import { workspaceService } from "@/services/workspace.service";
import { workspaceKeys } from "@/lib/query-keys";

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.list(),
    queryFn: workspaceService.list,
  });
}
