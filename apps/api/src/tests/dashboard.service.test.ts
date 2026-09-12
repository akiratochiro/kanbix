import { dashboardService } from "../services/dashboard.service";
import { dashboardRepository } from "../repositories/dashboard.repository";
import { assertBoardMembership } from "../utils/board-access";

jest.mock("../repositories/dashboard.repository");
jest.mock("../utils/board-access");

const mockedDashboardRepository = dashboardRepository as jest.Mocked<typeof dashboardRepository>;
const mockedAssertBoardMembership = assertBoardMembership as jest.Mock;

describe("dashboardService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAssertBoardMembership.mockResolvedValue(undefined);
    mockedDashboardRepository.countTotal.mockResolvedValue(0);
    mockedDashboardRepository.countCompleted.mockResolvedValue(0);
    mockedDashboardRepository.countOverdue.mockResolvedValue(0);
    mockedDashboardRepository.countByAssignee.mockResolvedValue([]);
    mockedDashboardRepository.findCompletedSince.mockResolvedValue([]);
  });

  it("verifica que o usuário é membro do board antes de agregar", async () => {
    await dashboardService.getBoardDashboard("board-uuid", "user-uuid");

    expect(mockedAssertBoardMembership).toHaveBeenCalledWith("board-uuid", "user-uuid");
  });

  it("calcula a taxa de conclusão como 0 quando não há cards", async () => {
    const result = await dashboardService.getBoardDashboard("board-uuid", "user-uuid");

    expect(result.totalCards).toBe(0);
    expect(result.completionRate).toBe(0);
  });

  it("calcula a taxa de conclusão arredondada em porcentagem", async () => {
    mockedDashboardRepository.countTotal.mockResolvedValue(3);
    mockedDashboardRepository.countCompleted.mockResolvedValue(1);

    const result = await dashboardService.getBoardDashboard("board-uuid", "user-uuid");

    expect(result.completionRate).toBe(33);
  });

  it("repassa a contagem de atrasados e por responsável", async () => {
    mockedDashboardRepository.countOverdue.mockResolvedValue(2);
    mockedDashboardRepository.countByAssignee.mockResolvedValue([
      { assigneeId: "user-a", count: 3 },
      { assigneeId: null, count: 1 },
    ]);

    const result = await dashboardService.getBoardDashboard("board-uuid", "user-uuid");

    expect(result.overdueCards).toBe(2);
    expect(result.cardsByAssignee).toEqual([
      { assigneeId: "user-a", count: 3 },
      { assigneeId: null, count: 1 },
    ]);
  });

  it("monta os últimos 14 dias em completedByDay, mesmo sem conclusões", async () => {
    const result = await dashboardService.getBoardDashboard("board-uuid", "user-uuid");

    expect(result.completedByDay).toHaveLength(14);
    expect(result.completedByDay.every((day) => day.count === 0)).toBe(true);
  });

  it("agrupa as conclusões por dia corretamente", async () => {
    const today = new Date();
    today.setHours(10, 0, 0, 0);

    mockedDashboardRepository.findCompletedSince.mockResolvedValue([
      { completedAt: today },
      { completedAt: today },
    ]);

    const result = await dashboardService.getBoardDashboard("board-uuid", "user-uuid");

    const todayKey = today.toISOString().slice(0, 10);
    const todayBucket = result.completedByDay.find((day) => day.date === todayKey);

    expect(todayBucket?.count).toBe(2);
  });
});
