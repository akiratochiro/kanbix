import { workspaceRepository } from "../repositories/workspace.repository";
import type { Workspace } from "@kanbix/shared-types";

interface CreateWorkspaceInput {
  name: string;
  description?: string;
  ownerId: string;
}

function toDTO(workspace: {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}): Workspace {
  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    createdAt: workspace.createdAt.toISOString(),
  };
}

export const workspaceService = {
  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const workspace = await workspaceRepository.create(input);
    return toDTO(workspace);
  },
};