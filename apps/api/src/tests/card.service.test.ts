import { cardService } from "../services/card.service";
import { cardRepository } from "../repositories/card.repository";
import { listRepository } from "../repositories/list.repository";
import { assertBoardMembership } from "../utils/board-access";
import { CardNotFoundError, ListNotFoundError } from "../utils/errors";
import type { Card as PrismaCard } from "@prisma/client";


jest.mock("../repositories/card.repository");
jest.mock("../repositories/list.repository");
jest.mock("../utils/board-access");

const mockedCardRepository = cardRepository as jest.Mocked<typeof cardRepository>;
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

const fakeCard = {
  id: "card-uuid",
  title: "Minha Tarefa",
  description: null,
  position: 0,
  priority: "MEDIUM",
  dueDate: null,
  listId: "list-uuid",
  assigneeId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies PrismaCard;

describe("cardService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAssertBoardMembership.mockResolvedValue(undefined);
  });

  describe("createCard", () => {
    it("deve criar o card quando a list existe e o usuário tem acesso", async () => {
      mockedListRepository.findById.mockResolvedValue(fakeList);
      mockedCardRepository.create.mockResolvedValue(fakeCard);

      const result = await cardService.createCard("list-uuid", "user-uuid", {
        title: "Minha Tarefa",
      });

      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
      expect(result.title).toBe("Minha Tarefa");
      expect(result.priority).toBe("MEDIUM");
    });

    it("deve lançar ListNotFoundError quando a list não existe", async () => {
      mockedListRepository.findById.mockResolvedValue(null);

      await expect(
        cardService.createCard("list-uuid", "user-uuid", { title: "X" })
      ).rejects.toThrow(ListNotFoundError);
      expect(mockedCardRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("updateCard", () => {
    it("deve atualizar o card sem mudar de list", async () => {
      mockedCardRepository.findById.mockResolvedValue(fakeCard);
      mockedListRepository.findById.mockResolvedValue(fakeList);
      mockedCardRepository.update.mockResolvedValue({ ...fakeCard, title: "Atualizado" });

      const result = await cardService.updateCard("card-uuid", "user-uuid", {
        title: "Atualizado",
      });

      expect(result.title).toBe("Atualizado");
      expect(mockedAssertBoardMembership).toHaveBeenCalledTimes(1);
    });

    it("deve checar acesso ao board de destino quando o card muda de list", async () => {
      const targetList = { ...fakeList, id: "list-2-uuid", boardId: "board-2-uuid" };

      mockedCardRepository.findById.mockResolvedValue(fakeCard);
      mockedListRepository.findById
        .mockResolvedValueOnce(fakeList) // list atual
        .mockResolvedValueOnce(targetList); // list de destino
      mockedCardRepository.update.mockResolvedValue({ ...fakeCard, listId: "list-2-uuid" });

      await cardService.updateCard("card-uuid", "user-uuid", { listId: "list-2-uuid" });

      expect(mockedAssertBoardMembership).toHaveBeenNthCalledWith(1, "board-uuid", "user-uuid");
      expect(mockedAssertBoardMembership).toHaveBeenNthCalledWith(2, "board-2-uuid", "user-uuid");
    });

    it("deve lançar CardNotFoundError quando o card não existe", async () => {
      mockedCardRepository.findById.mockResolvedValue(null);

      await expect(
        cardService.updateCard("card-uuid", "user-uuid", { title: "X" })
      ).rejects.toThrow(CardNotFoundError);
    });
  });

  describe("deleteCard", () => {
    it("deve excluir o card quando ele existe e o usuário tem acesso", async () => {
      mockedCardRepository.findById.mockResolvedValue(fakeCard);
      mockedListRepository.findById.mockResolvedValue(fakeList);
      mockedCardRepository.delete.mockResolvedValue(undefined);

      await cardService.deleteCard("card-uuid", "user-uuid");

      expect(mockedCardRepository.delete).toHaveBeenCalledWith("card-uuid");
    });
  });
});