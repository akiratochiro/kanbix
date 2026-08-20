import { boardRepository } from "../repositories/board.repository";
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
};