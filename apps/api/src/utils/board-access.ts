import { boardRepository } from "../repositories/board.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { BoardNotFoundError } from "./errors";

export async function assertBoardMembership(boardId: string, userId: string): Promise<void> {
  const board = await boardRepository.findById(boardId);

  if (!board) {
    throw new BoardNotFoundError();
  }

  const membership = await workspaceRepository.findMembership(userId, board.workspaceId);

  if (!membership) {
    throw new BoardNotFoundError();
  }
}