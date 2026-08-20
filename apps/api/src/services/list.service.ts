import { listRepository } from "../repositories/list.repository";
import { boardRepository } from "../repositories/board.repository";
import { assertBoardMembership } from "../utils/board-access";
import { ListNotFoundError } from "../utils/errors";
import type { List } from "@kanbix/shared-types";

function toDTO(list: { id: string; name: string; position: number; boardId: string; createdAt: Date }): List {
  return {
    id: list.id,
    name: list.name,
    position: list.position,
    boardId: list.boardId,
    createdAt: list.createdAt.toISOString(),
  };
}

export const listService = {
  async createList(boardId: string, userId: string, name: string): Promise<List> {
    await assertBoardMembership(boardId, userId);
    const list = await listRepository.create({ name, boardId });
    return toDTO(list);
  },

  async getListsByBoardId(boardId: string, userId: string): Promise<List[]> {
    await assertBoardMembership(boardId, userId);
    const lists = await listRepository.findManyByBoardId(boardId);
    return lists.map(toDTO);
  },

  async deleteList(listId: string, userId: string): Promise<void> {
    const list = await listRepository.findById(listId);
    if (!list) throw new ListNotFoundError();

    await assertBoardMembership(list.boardId, userId);
    await listRepository.delete(listId);
  },
};