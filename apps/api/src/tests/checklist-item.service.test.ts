import { checklistItemService } from "../services/checklist-item.service";
import { checklistItemRepository } from "../repositories/checklist-item.repository";
import { cardRepository } from "../repositories/card.repository";
import { listRepository } from "../repositories/list.repository";
import { assertBoardMembership } from "../utils/board-access";
import { CardNotFoundError, ChecklistItemNotFoundError } from "../utils/errors";

jest.mock("../repositories/checklist-item.repository");
jest.mock("../repositories/card.repository");
jest.mock("../repositories/list.repository");
jest.mock("../utils/board-access");

const mockedChecklistItemRepository = checklistItemRepository as jest.Mocked<
  typeof checklistItemRepository
>;
const mockedCardRepository = cardRepository as jest.Mocked<typeof cardRepository>;
const mockedListRepository = listRepository as jest.Mocked<typeof listRepository>;
const mockedAssertBoardMembership = assertBoardMembership as jest.Mock;

const fakeCard = {
  id: "card-uuid",
  title: "Minha Tarefa",
  listId: "list-uuid",
};

const fakeList = {
  id: "list-uuid",
  name: "A Fazer",
  position: 0,
  boardId: "board-uuid",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fakeItem = {
  id: "item-uuid",
  text: "Escrever testes",
  completed: false,
  position: 0,
  cardId: "card-uuid",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("checklistItemService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAssertBoardMembership.mockResolvedValue(undefined);
    // @ts-expect-error mock parcial: só os campos usados pelo service
    mockedCardRepository.findById.mockResolvedValue(fakeCard);
    mockedListRepository.findById.mockResolvedValue(fakeList);
  });

  describe("createItem", () => {
    it("deve criar o item após confirmar o acesso ao board do card", async () => {
      mockedChecklistItemRepository.create.mockResolvedValue(fakeItem);

      const result = await checklistItemService.createItem(
        "card-uuid",
        "user-uuid",
        "Escrever testes"
      );

      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
      expect(result).toEqual({
        id: "item-uuid",
        text: "Escrever testes",
        completed: false,
        position: 0,
        cardId: "card-uuid",
        createdAt: expect.any(String),
      });
    });

    it("deve lançar CardNotFoundError quando o card não existe", async () => {
      mockedCardRepository.findById.mockResolvedValue(null);

      await expect(
        checklistItemService.createItem("card-uuid", "user-uuid", "X")
      ).rejects.toThrow(CardNotFoundError);
      expect(mockedChecklistItemRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getItemsByCardId", () => {
    it("deve retornar os itens do card", async () => {
      mockedChecklistItemRepository.findManyByCardId.mockResolvedValue([fakeItem]);

      const result = await checklistItemService.getItemsByCardId("card-uuid", "user-uuid");

      expect(result).toHaveLength(1);
      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
    });
  });

  describe("updateItem", () => {
    it("deve marcar o item como concluído", async () => {
      mockedChecklistItemRepository.findById.mockResolvedValue(fakeItem);
      mockedChecklistItemRepository.update.mockResolvedValue({
        ...fakeItem,
        completed: true,
      });

      const result = await checklistItemService.updateItem("item-uuid", "user-uuid", {
        completed: true,
      });

      expect(mockedChecklistItemRepository.update).toHaveBeenCalledWith("item-uuid", {
        completed: true,
      });
      expect(result.completed).toBe(true);
    });

    it("deve lançar ChecklistItemNotFoundError quando o item não existe", async () => {
      mockedChecklistItemRepository.findById.mockResolvedValue(null);

      await expect(
        checklistItemService.updateItem("item-uuid", "user-uuid", { completed: true })
      ).rejects.toThrow(ChecklistItemNotFoundError);
      expect(mockedAssertBoardMembership).not.toHaveBeenCalled();
    });
  });

  describe("deleteItem", () => {
    it("deve excluir o item quando ele existe e o usuário tem acesso", async () => {
      mockedChecklistItemRepository.findById.mockResolvedValue(fakeItem);
      mockedChecklistItemRepository.delete.mockResolvedValue(undefined);

      await checklistItemService.deleteItem("item-uuid", "user-uuid");

      expect(mockedChecklistItemRepository.delete).toHaveBeenCalledWith("item-uuid");
    });

    it("deve lançar ChecklistItemNotFoundError quando o item não existe", async () => {
      mockedChecklistItemRepository.findById.mockResolvedValue(null);

      await expect(
        checklistItemService.deleteItem("item-uuid", "user-uuid")
      ).rejects.toThrow(ChecklistItemNotFoundError);
      expect(mockedAssertBoardMembership).not.toHaveBeenCalled();
    });
  });
});
