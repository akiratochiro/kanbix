import { labelRepository } from "../repositories/label.repository";
import { assertBoardMembership } from "../utils/board-access";
import { LabelNotFoundError } from "../utils/errors";
import type { Label } from "@kanbix/shared-types";

function toDTO(label: {
  id: string;
  name: string;
  color: string;
  boardId: string;
  createdAt: Date;
}): Label {
  return {
    id: label.id,
    name: label.name,
    color: label.color,
    boardId: label.boardId,
    createdAt: label.createdAt.toISOString(),
  };
}

export const labelService = {
  async createLabel(
    boardId: string,
    userId: string,
    data: { name: string; color: string }
  ): Promise<Label> {
    await assertBoardMembership(boardId, userId);
    const label = await labelRepository.create({ ...data, boardId });
    return toDTO(label);
  },

  async getLabelsByBoardId(boardId: string, userId: string): Promise<Label[]> {
    await assertBoardMembership(boardId, userId);
    const labels = await labelRepository.findManyByBoardId(boardId);
    return labels.map(toDTO);
  },

  async updateLabel(
    labelId: string,
    userId: string,
    data: { name?: string; color?: string }
  ): Promise<Label> {
    const label = await labelRepository.findById(labelId);
    if (!label) throw new LabelNotFoundError();

    await assertBoardMembership(label.boardId, userId);

    const updated = await labelRepository.update(labelId, data);
    return toDTO(updated);
  },

  async deleteLabel(labelId: string, userId: string): Promise<void> {
    const label = await labelRepository.findById(labelId);
    if (!label) throw new LabelNotFoundError();

    await assertBoardMembership(label.boardId, userId);
    await labelRepository.delete(labelId);
  },
};
