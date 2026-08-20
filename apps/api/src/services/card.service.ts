import { cardRepository } from "../repositories/card.repository";
import { listRepository } from "../repositories/list.repository";
import { assertBoardMembership } from "../utils/board-access";
import { CardNotFoundError, ListNotFoundError } from "../utils/errors";
import type { Card } from "@kanbix/shared-types";

interface CreateCardInput {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  assigneeId?: string;
}

interface UpdateCardInput {
  title?: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string | null;
  assigneeId?: string | null;
  listId?: string;
}

function toDTO(card: {
  id: string; title: string; description: string | null; position: number;
  priority: string; dueDate: Date | null; listId: string; assigneeId: string | null; createdAt: Date;
}): Card {
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    position: card.position,
    priority: card.priority as Card["priority"],
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
    listId: card.listId,
    assigneeId: card.assigneeId,
    createdAt: card.createdAt.toISOString(),
  };
}

async function getListOrThrow(listId: string) {
  const list = await listRepository.findById(listId);
  if (!list) throw new ListNotFoundError();
  return list;
}

export const cardService = {
  async createCard(listId: string, userId: string, input: CreateCardInput): Promise<Card> {
    const list = await getListOrThrow(listId);
    await assertBoardMembership(list.boardId, userId);

    const card = await cardRepository.create({
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      listId,
    });
    return toDTO(card);
  },

  async getCardsByListId(listId: string, userId: string): Promise<Card[]> {
    const list = await getListOrThrow(listId);
    await assertBoardMembership(list.boardId, userId);

    const cards = await cardRepository.findManyByListId(listId);
    return cards.map(toDTO);
  },

  async updateCard(cardId: string, userId: string, input: UpdateCardInput): Promise<Card> {
    const card = await cardRepository.findById(cardId);
    if (!card) throw new CardNotFoundError();

    const currentList = await getListOrThrow(card.listId);
    await assertBoardMembership(currentList.boardId, userId);

    if (input.listId && input.listId !== card.listId) {
      const targetList = await getListOrThrow(input.listId);
      await assertBoardMembership(targetList.boardId, userId);
    }

    const updated = await cardRepository.update(cardId, {
      ...input,
      dueDate: input.dueDate === undefined ? undefined : input.dueDate ? new Date(input.dueDate) : null,
    });
    return toDTO(updated);
  },

  async deleteCard(cardId: string, userId: string): Promise<void> {
    const card = await cardRepository.findById(cardId);
    if (!card) throw new CardNotFoundError();

    const list = await getListOrThrow(card.listId);
    await assertBoardMembership(list.boardId, userId);

    await cardRepository.delete(cardId);
  },
};