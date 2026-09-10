import { boardRepository } from "../repositories/board.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { assertBoardMembership } from "../utils/board-access";
import { BoardNotFoundError, InsufficientPermissionError } from "../utils/errors";
import type { Board } from "@kanbix/shared-types";

interface CreateBoardInput {
  name: string;
  description?: string;
  color?: string;
  workspaceId: string;
  createdById: string;
}

function toDTO(board: {
  id: string;
  name: string;
  description: string | null;
  color: string;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
}): Board {
  return {
    id: board.id,
    name: board.name,
    description: board.description,
    color: board.color,
    workspaceId: board.workspaceId,
    createdById: board.createdById,
    createdAt: board.createdAt.toISOString(),
  };
}

export const boardService = {
  async createBoard(input: CreateBoardInput): Promise<Board> {
    const board = await boardRepository.create(input);
    return toDTO(board);
  },

  async getBoardsByWorkspaceId(workspaceId: string): Promise<Board[]> {
    const boards = await boardRepository.findManyByWorkspaceId(workspaceId);
    return boards.map(toDTO);
  },

  async getBoardById(boardId: string, userId: string): Promise<Board> {
    // Lança BoardNotFoundError se o board não existe ou se o usuário
    // não é membro do workspace dele.
    await assertBoardMembership(boardId, userId);

    const board = await boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundError();
    }

    return toDTO(board);
  },

  async deleteBoard(boardId: string, userId: string): Promise<void> {
    const board = await boardRepository.findById(boardId);

    if (!board) {
      throw new BoardNotFoundError();
    }

    const isCreator = board.createdById === userId;

    if (!isCreator) {
      const membership = await workspaceRepository.findMembership(
        userId,
        board.workspaceId
      );

      const hasElevatedRole =
        membership?.role === "ADMIN" || membership?.role === "OWNER";

      if (!hasElevatedRole) {
        throw new InsufficientPermissionError();
      }
    }

    await boardRepository.delete(boardId);
  },
};