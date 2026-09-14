import { boardRepository } from "../repositories/board.repository";
import { workspaceRepository } from "../repositories/workspace.repository";
import { BoardNotFoundError, InsufficientPermissionError } from "./errors";

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

/**
 * Quem pode editar/excluir o board: quem criou, ou ADMIN/OWNER do
 * workspace. Assume que `board` já foi buscado (findById) por quem chama.
 */
export async function assertBoardEditPermission(
  board: { workspaceId: string; createdById: string },
  userId: string
): Promise<void> {
  if (board.createdById === userId) return;

  const membership = await workspaceRepository.findMembership(userId, board.workspaceId);
  const hasElevatedRole = membership?.role === "ADMIN" || membership?.role === "OWNER";

  if (!hasElevatedRole) {
    throw new InsufficientPermissionError();
  }
}