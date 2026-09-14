import { checklistItemRepository } from "../repositories/checklist-item.repository";
import { cardRepository } from "../repositories/card.repository";
import { listRepository } from "../repositories/list.repository";
import { assertBoardMembership } from "../utils/board-access";
import {
  CardNotFoundError,
  ChecklistItemNotFoundError,
  ListNotFoundError,
} from "../utils/errors";
import type { ChecklistItem } from "@kanbix/shared-types";

function toDTO(item: {
  id: string;
  text: string;
  completed: boolean;
  position: number;
  cardId: string;
  createdAt: Date;
}): ChecklistItem {
  return {
    id: item.id,
    text: item.text,
    completed: item.completed,
    position: item.position,
    cardId: item.cardId,
    createdAt: item.createdAt.toISOString(),
  };
}

async function assertCardAccess(cardId: string, userId: string) {
  const card = await cardRepository.findById(cardId);
  if (!card) throw new CardNotFoundError();

  const list = await listRepository.findById(card.listId);
  if (!list) throw new ListNotFoundError();

  await assertBoardMembership(list.boardId, userId);
}

export const checklistItemService = {
  async createItem(cardId: string, userId: string, text: string): Promise<ChecklistItem> {
    await assertCardAccess(cardId, userId);
    const item = await checklistItemRepository.create({ text, cardId });
    return toDTO(item);
  },

  async getItemsByCardId(cardId: string, userId: string): Promise<ChecklistItem[]> {
    await assertCardAccess(cardId, userId);
    const items = await checklistItemRepository.findManyByCardId(cardId);
    return items.map(toDTO);
  },

  async updateItem(
    itemId: string,
    userId: string,
    data: { text?: string; completed?: boolean }
  ): Promise<ChecklistItem> {
    const item = await checklistItemRepository.findById(itemId);
    if (!item) throw new ChecklistItemNotFoundError();

    await assertCardAccess(item.cardId, userId);

    const updated = await checklistItemRepository.update(itemId, data);
    return toDTO(updated);
  },

  async deleteItem(itemId: string, userId: string): Promise<void> {
    const item = await checklistItemRepository.findById(itemId);
    if (!item) throw new ChecklistItemNotFoundError();

    await assertCardAccess(item.cardId, userId);
    await checklistItemRepository.delete(itemId);
  },
};
