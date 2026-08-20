import { listService } from "../services/list.service";
import { listRepository } from "../repositories/list.repository";
import { assertBoardMembership } from "../utils/board-access";
import { ListNotFoundError } from "../utils/errors";

jest.mock("../repositories/list.repository");
jest.mock("../utils/board-access");

const mockedListRepository = listRepository as jest.Mocked<typeof listRepository>;
const mockedAssertBoardMembership = assertBoardMembership as jest.Mock;

const fakeList = {
  id: "list-uuid",
  name: "A Fazer",
  position: 0,
  boardId: "board-uuid",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("listService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAssertBoardMembership.mockResolvedValue(undefined);
  });

  describe("createList", () => {
    it("deve criar a list após confirmar o acesso ao board", async () => {
      mockedListRepository.create.mockResolvedValue(fakeList);

      const result = await listService.createList("board-uuid", "user-uuid", "A Fazer");

      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
      expect(result).toEqual({
        id: "list-uuid",
        name: "A Fazer",
        position: 0,
        boardId: "board-uuid",
        createdAt: expect.any(String),
      });
    });

    it("não deve criar a list quando o acesso ao board é negado", async () => {
      mockedAssertBoardMembership.mockRejectedValue(new Error("sem acesso"));

      await expect(
        listService.createList("board-uuid", "user-uuid", "A Fazer")
      ).rejects.toThrow();
      expect(mockedListRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getListsByBoardId", () => {
    it("deve retornar as lists do board", async () => {
      mockedListRepository.findManyByBoardId.mockResolvedValue([fakeList]);

      const result = await listService.getListsByBoardId("board-uuid", "user-uuid");

      expect(result).toHaveLength(1);
      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
    });
  });

  describe("deleteList", () => {
    it("deve excluir a list quando ela existe e o usuário tem acesso", async () => {
      mockedListRepository.findById.mockResolvedValue(fakeList);
      mockedListRepository.delete.mockResolvedValue(undefined);

      await listService.deleteList("list-uuid", "user-uuid");

      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
      expect(mockedListRepository.delete).toHaveBeenCalledWith("list-uuid");
    });

    it("deve lançar ListNotFoundError quando a list não existe", async () => {
      mockedListRepository.findById.mockResolvedValue(null);

      await expect(listService.deleteList("list-uuid", "user-uuid")).rejects.toThrow(
        ListNotFoundError
      );
      expect(mockedAssertBoardMembership).not.toHaveBeenCalled();
    });
  });
});