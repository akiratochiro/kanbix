import { labelService } from "../services/label.service";
import { labelRepository } from "../repositories/label.repository";
import { assertBoardMembership } from "../utils/board-access";
import { LabelNotFoundError } from "../utils/errors";

jest.mock("../repositories/label.repository");
jest.mock("../utils/board-access");

const mockedLabelRepository = labelRepository as jest.Mocked<typeof labelRepository>;
const mockedAssertBoardMembership = assertBoardMembership as jest.Mock;

const fakeLabel = {
  id: "label-uuid",
  name: "Bug",
  color: "#EF4444",
  boardId: "board-uuid",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("labelService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAssertBoardMembership.mockResolvedValue(undefined);
  });

  describe("createLabel", () => {
    it("deve criar a label após confirmar o acesso ao board", async () => {
      mockedLabelRepository.create.mockResolvedValue(fakeLabel);

      const result = await labelService.createLabel("board-uuid", "user-uuid", {
        name: "Bug",
        color: "#EF4444",
      });

      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
      expect(result).toEqual({
        id: "label-uuid",
        name: "Bug",
        color: "#EF4444",
        boardId: "board-uuid",
        createdAt: expect.any(String),
      });
    });

    it("não deve criar a label quando o acesso ao board é negado", async () => {
      mockedAssertBoardMembership.mockRejectedValue(new Error("sem acesso"));

      await expect(
        labelService.createLabel("board-uuid", "user-uuid", {
          name: "Bug",
          color: "#EF4444",
        })
      ).rejects.toThrow();
      expect(mockedLabelRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getLabelsByBoardId", () => {
    it("deve retornar as labels do board", async () => {
      mockedLabelRepository.findManyByBoardId.mockResolvedValue([fakeLabel]);

      const result = await labelService.getLabelsByBoardId("board-uuid", "user-uuid");

      expect(result).toHaveLength(1);
      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
    });
  });

  describe("updateLabel", () => {
    it("deve atualizar a label quando ela existe e o usuário tem acesso", async () => {
      mockedLabelRepository.findById.mockResolvedValue(fakeLabel);
      mockedLabelRepository.update.mockResolvedValue({ ...fakeLabel, name: "Bug crítico" });

      const result = await labelService.updateLabel("label-uuid", "user-uuid", {
        name: "Bug crítico",
      });

      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
      expect(mockedLabelRepository.update).toHaveBeenCalledWith("label-uuid", {
        name: "Bug crítico",
      });
      expect(result.name).toBe("Bug crítico");
    });

    it("deve lançar LabelNotFoundError quando a label não existe", async () => {
      mockedLabelRepository.findById.mockResolvedValue(null);

      await expect(
        labelService.updateLabel("label-uuid", "user-uuid", { name: "Bug crítico" })
      ).rejects.toThrow(LabelNotFoundError);
      expect(mockedAssertBoardMembership).not.toHaveBeenCalled();
    });
  });

  describe("deleteLabel", () => {
    it("deve excluir a label quando ela existe e o usuário tem acesso", async () => {
      mockedLabelRepository.findById.mockResolvedValue(fakeLabel);
      mockedLabelRepository.delete.mockResolvedValue(undefined);

      await labelService.deleteLabel("label-uuid", "user-uuid");

      expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
      expect(mockedLabelRepository.delete).toHaveBeenCalledWith("label-uuid");
    });

    it("deve lançar LabelNotFoundError quando a label não existe", async () => {
      mockedLabelRepository.findById.mockResolvedValue(null);

      await expect(labelService.deleteLabel("label-uuid", "user-uuid")).rejects.toThrow(
        LabelNotFoundError
      );
      expect(mockedAssertBoardMembership).not.toHaveBeenCalled();
    });
  });
});
