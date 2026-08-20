import { boardService } from "../services/board.service";
import { boardRepository } from "../repositories/board.repository";



jest.mock("../repositories/board.repository");

const mockedBoardRepository = boardRepository as jest.Mocked<typeof boardRepository>;

describe("boardService.createBoard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um board e retornar o DTO", async () => {
    mockedBoardRepository.create.mockResolvedValue({
      id: "board-uuid",
      name: "Meu Board",
      description: null,
      color: "#3B82F6",
      workspaceId: "workspace-uuid",
      createdById: "user-uuid",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await boardService.createBoard({
      name: "Meu Board",
      workspaceId: "workspace-uuid",
      createdById: "user-uuid",
    });

    expect(result).toEqual({
      id: "board-uuid",
      name: "Meu Board",
      description: null,
      color: "#3B82F6",
      workspaceId: "workspace-uuid",
      createdById: "user-uuid",
      createdAt: expect.any(String),
    });
  });
});

describe("boardService.getBoardsByWorkspaceId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar os boards do workspace", async () => {
    mockedBoardRepository.findManyByWorkspaceId.mockResolvedValue([
      {
        id: "board-1",
        name: "Board 1",
        description: null,
        color: "#3B82F6",
        workspaceId: "workspace-uuid",
        createdById: "user-uuid",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await boardService.getBoardsByWorkspaceId("workspace-uuid");

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Board 1");
  });
});



import { workspaceRepository } from "../repositories/workspace.repository";
import { BoardNotFoundError, InsufficientPermissionError } from "../utils/errors";

jest.mock("../repositories/workspace.repository");
const mockedWorkspaceRepository = workspaceRepository as jest.Mocked<typeof workspaceRepository>;

describe("boardService.deleteBoard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve excluir o board quando o usuário é o criador", async () => {
    mockedBoardRepository.findById.mockResolvedValue({
      id: "board-uuid",
      name: "Board",
      description: null,
      color: "#3B82F6",
      workspaceId: "workspace-uuid",
      createdById: "user-uuid",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockedBoardRepository.delete.mockResolvedValue(undefined);

    await boardService.deleteBoard("board-uuid", "user-uuid");

    expect(mockedBoardRepository.delete).toHaveBeenCalledWith("board-uuid");
    expect(mockedWorkspaceRepository.findMembership).not.toHaveBeenCalled();
  });

  it("deve excluir o board quando o usuário não é o criador, mas é ADMIN do workspace", async () => {
    mockedBoardRepository.findById.mockResolvedValue({
      id: "board-uuid",
      name: "Board",
      description: null,
      color: "#3B82F6",
      workspaceId: "workspace-uuid",
      createdById: "outro-user-uuid",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockedWorkspaceRepository.findMembership.mockResolvedValue({
      id: "membership-uuid",
      role: "ADMIN",
      createdAt: new Date(),
      userId: "user-uuid",
      workspaceId: "workspace-uuid",
    });
    mockedBoardRepository.delete.mockResolvedValue(undefined);

    await boardService.deleteBoard("board-uuid", "user-uuid");

    expect(mockedBoardRepository.delete).toHaveBeenCalledWith("board-uuid");
  });

  it("deve lançar InsufficientPermissionError quando não é criador nem tem papel elevado", async () => {
    mockedBoardRepository.findById.mockResolvedValue({
      id: "board-uuid",
      name: "Board",
      description: null,
      color: "#3B82F6",
      workspaceId: "workspace-uuid",
      createdById: "outro-user-uuid",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockedWorkspaceRepository.findMembership.mockResolvedValue({
      id: "membership-uuid",
      role: "MEMBER",
      createdAt: new Date(),
      userId: "user-uuid",
      workspaceId: "workspace-uuid",
    });

    await expect(boardService.deleteBoard("board-uuid", "user-uuid")).rejects.toThrow(
      InsufficientPermissionError
    );
    expect(mockedBoardRepository.delete).not.toHaveBeenCalled();
  });

  it("deve lançar BoardNotFoundError quando o board não existe", async () => {
    mockedBoardRepository.findById.mockResolvedValue(null);

    await expect(boardService.deleteBoard("board-uuid", "user-uuid")).rejects.toThrow(
      BoardNotFoundError
    );
  });
});