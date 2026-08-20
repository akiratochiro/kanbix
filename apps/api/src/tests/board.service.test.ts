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