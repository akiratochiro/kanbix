import { cardRepository } from "../repositories/card.repository";
import { listRepository } from "../repositories/list.repository";
import { labelRepository } from "../repositories/label.repository";
import { assertBoardMembership } from "../utils/board-access";
import { CardNotFoundError, LabelNotFoundError, ListNotFoundError } from "../utils/errors";
import { toLabelDTO } from "./label.service";
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
  completedAt?: string | null;
  assigneeId?: string | null;
  listId?: string;
}

function toDTO(card: {
  id: string; title: string; description: string | null; position: number;
  priority: string; dueDate: Date | null; completedAt: Date | null; listId: string; assigneeId: string | null; createdAt: Date;
  labels: { id: string; name: string; color: string; boardId: string; createdAt: Date }[];
}): Card {
  return {
    id: card.id,
    title: card.title,
    description: card.description,
    position: card.position,
    priority: card.priority as Card["priority"],
    dueDate: card.dueDate ? card.dueDate.toISOString() : null,
    completedAt: card.completedAt ? card.completedAt.toISOString() : null,
    listId: card.listId,
    assigneeId: card.assigneeId,
    createdAt: card.createdAt.toISOString(),
    labels: card.labels.map(toLabelDTO),
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

  async getCardById(cardId: string, userId: string): Promise<Card> {
    const card = await cardRepository.findById(cardId);
    if (!card) throw new CardNotFoundError();

    const list = await getListOrThrow(card.listId);
    await assertBoardMembership(list.boardId, userId);

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
      completedAt:
        input.completedAt === undefined
          ? undefined
          : input.completedAt
            ? new Date(input.completedAt)
            : null,
    });
    return toDTO(updated);
  },

  async moveCard(
    cardId: string,
    userId: string,
    input: { toListId: string; toIndex: number }
  ): Promise<Card> {
    const card = await cardRepository.findById(cardId);
    if (!card) throw new CardNotFoundError();

    const sourceList = await getListOrThrow(card.listId);
    await assertBoardMembership(sourceList.boardId, userId);

    const targetList = await getListOrThrow(input.toListId);
    // Só movemos dentro do mesmo board.
    if (targetList.boardId !== sourceList.boardId) {
      throw new ListNotFoundError();
    }

    const targetCount = await cardRepository.countByListId(input.toListId);
    const sameList = input.toListId === card.listId;
    // Índice máximo válido: dentro da mesma lista o próprio card já ocupa
    // uma posição; em outra lista pode ir para o fim (targetCount).
    const maxIndex = sameList ? Math.max(0, targetCount - 1) : targetCount;
    const newPosition = Math.max(0, Math.min(input.toIndex, maxIndex));

    const moved = await cardRepository.move({
      cardId,
      sourceListId: card.listId,
      targetListId: input.toListId,
      oldPosition: card.position,
      newPosition,
    });

    return toDTO(moved);
  },

  async deleteCard(cardId: string, userId: string): Promise<void> {
    const card = await cardRepository.findById(cardId);
    if (!card) throw new CardNotFoundError();

    const list = await getListOrThrow(card.listId);
    await assertBoardMembership(list.boardId, userId);

    await cardRepository.delete(cardId);
  },

  async addLabelToCard(cardId: string, labelId: string, userId: string): Promise<Card> {
    const card = await cardRepository.findById(cardId);
    if (!card) throw new CardNotFoundError();

    const list = await getListOrThrow(card.listId);
    await assertBoardMembership(list.boardId, userId);

    const label = await labelRepository.findById(labelId);
    // Uma label de outro board não é válida aqui — mesmo erro de "não
    // encontrada" que ela teria fora do escopo desse board.
    if (!label || label.boardId !== list.boardId) throw new LabelNotFoundError();

    const updated = await cardRepository.addLabel(cardId, labelId);
    return toDTO(updated);
  },

  async removeLabelFromCard(cardId: string, labelId: string, userId: string): Promise<Card> {
    const card = await cardRepository.findById(cardId);
    if (!card) throw new CardNotFoundError();

    const list = await getListOrThrow(card.listId);
    await assertBoardMembership(list.boardId, userId);

    const updated = await cardRepository.removeLabel(cardId, labelId);
    return toDTO(updated);
  },
};