import type { Request, Response, NextFunction } from "express";
import { requireWorkspaceRole } from "../middlewares/require-workspace-role";
import { workspaceRepository } from "../repositories/workspace.repository";
import { WorkspaceNotFoundError, InsufficientPermissionError } from "../utils/errors";

jest.mock("../repositories/workspace.repository");

const mockedWorkspaceRepository = workspaceRepository as jest.Mocked<typeof workspaceRepository>;

function createMockReq(overrides: Partial<Request> = {}): Request {
  return {
    userId: "user-uuid",
    params: { id: "workspace-uuid" },
    ...overrides,
  } as Request;
}

describe("requireWorkspaceRole", () => {
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it("deve chamar next() sem erro quando o usuário tem o papel exato exigido", async () => {
    mockedWorkspaceRepository.findMembership.mockResolvedValue({
      id: "membership-uuid",
      role: "ADMIN",
      createdAt: new Date(),
      userId: "user-uuid",
      workspaceId: "workspace-uuid",
    });

    const req = createMockReq();
    const middleware = requireWorkspaceRole("ADMIN");

    await middleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.workspaceRole).toBe("ADMIN");
  });

  it("deve chamar next() quando o usuário tem um papel superior ao exigido", async () => {
    mockedWorkspaceRepository.findMembership.mockResolvedValue({
      id: "membership-uuid",
      role: "OWNER",
      createdAt: new Date(),
      userId: "user-uuid",
      workspaceId: "workspace-uuid",
    });

    const req = createMockReq();
    const middleware = requireWorkspaceRole("ADMIN");

    await middleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("deve chamar next(InsufficientPermissionError) quando o papel é inferior ao exigido", async () => {
    mockedWorkspaceRepository.findMembership.mockResolvedValue({
      id: "membership-uuid",
      role: "MEMBER",
      createdAt: new Date(),
      userId: "user-uuid",
      workspaceId: "workspace-uuid",
    });

    const req = createMockReq();
    const middleware = requireWorkspaceRole("ADMIN");

    await middleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(InsufficientPermissionError));
  });

  it("deve chamar next(WorkspaceNotFoundError) quando o usuário não é membro do workspace", async () => {
    mockedWorkspaceRepository.findMembership.mockResolvedValue(null);

    const req = createMockReq();
    const middleware = requireWorkspaceRole("MEMBER");

    await middleware(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(WorkspaceNotFoundError));
  });
});