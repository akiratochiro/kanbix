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