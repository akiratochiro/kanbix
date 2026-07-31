import { workspaceService } from "../services/workspace.service";
import { workspaceRepository } from "../repositories/workspace.repository";

jest.mock("../repositories/workspace.repository");

const mockedWorkspaceRepository = workspaceRepository as jest.Mocked<typeof workspaceRepository>;

describe("workspaceService.createWorkspace", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um workspace e retornar o DTO", async () => {
    mockedWorkspaceRepository.create.mockResolvedValue({
      id: "workspace-uuid",
      name: "Meu Workspace",
      description: "Descrição do workspace",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await workspaceService.createWorkspace({
      name: "Meu Workspace",
      description: "Descrição do workspace",
      ownerId: "user-uuid",
    });

    expect(result).toEqual({
      id: "workspace-uuid",
      name: "Meu Workspace",
      description: "Descrição do workspace",
      createdAt: expect.any(String),
    });

    expect(mockedWorkspaceRepository.create).toHaveBeenCalledWith({
      name: "Meu Workspace",
      description: "Descrição do workspace",
      ownerId: "user-uuid",
    });
  });

  it("deve criar um workspace sem descrição corretamente", async () => {
    mockedWorkspaceRepository.create.mockResolvedValue({
      id: "workspace-uuid",
      name: "Meu Workspace",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await workspaceService.createWorkspace({
      name: "Meu Workspace",
      ownerId: "user-uuid",
    });

    expect(result.description).toBeNull();
  });
});

import type { WorkspaceRole } from "@prisma/client";

describe("workspaceService.getWorkspacesByUserId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar os workspaces do usuário, com o papel de cada um", async () => {
    mockedWorkspaceRepository.findManyByUserId.mockResolvedValue([
      {
        id: "membership-1",
        role: "OWNER" as WorkspaceRole,
        createdAt: new Date(),
        userId: "user-uuid",
        workspaceId: "workspace-1",
        workspace: {
          id: "workspace-1",
          name: "Workspace do João",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "membership-2",
        role: "MEMBER" as WorkspaceRole,
        createdAt: new Date(),
        userId: "user-uuid",
        workspaceId: "workspace-2",
        workspace: {
          id: "workspace-2",
          name: "Workspace da Maria",
          description: "Projetos da Maria",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ]);

    const result = await workspaceService.getWorkspacesByUserId("user-uuid");

    expect(result).toEqual([
      {
        id: "workspace-1",
        name: "Workspace do João",
        description: null,
        createdAt: expect.any(String),
        role: "OWNER",
      },
      {
        id: "workspace-2",
        name: "Workspace da Maria",
        description: "Projetos da Maria",
        createdAt: expect.any(String),
        role: "MEMBER",
      },
    ]);
  });

  it("deve retornar uma lista vazia quando o usuário não é membro de nenhum workspace", async () => {
    mockedWorkspaceRepository.findManyByUserId.mockResolvedValue([]);

    const result = await workspaceService.getWorkspacesByUserId("user-uuid");

    expect(result).toEqual([]);
  });
});