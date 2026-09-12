import request from "supertest";
import { app } from "../app";
import { prisma } from "../config/prisma";

afterEach(async () => {
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createUser(name: string, email: string) {
  await request(app)
    .post("/api/users")
    .send({ name, email, password: "senha12345" });

  const login = await request(app)
    .post("/api/login")
    .send({ email, password: "senha12345" });

  return { token: login.body.token as string, userId: login.body.user.id as string };
}

async function createBoardWithList(token: string) {
  const workspace = await request(app)
    .post("/api/workspaces")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Workspace Dashboard" });

  const board = await request(app)
    .post(`/api/workspaces/${workspace.body.id}/boards`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Board Dashboard" });

  const list = await request(app)
    .post(`/api/boards/${board.body.id}/lists`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "A Fazer" });

  return { workspaceId: workspace.body.id as string, boardId: board.body.id as string, listId: list.body.id as string };
}

async function createCard(token: string, listId: string, title: string) {
  const response = await request(app)
    .post(`/api/lists/${listId}/cards`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title });
  return response.body.id as string;
}

async function patchCard(token: string, cardId: string, body: Record<string, unknown>) {
  return request(app)
    .patch(`/api/cards/${cardId}`)
    .set("Authorization", `Bearer ${token}`)
    .send(body);
}

describe("GET /api/boards/:id/dashboard", () => {
  it("agrega total, concluídos, atrasados, por responsável e produtividade", async () => {
    const owner = await createUser("Dona do Board", "owner@example.com");
    const { boardId, listId, workspaceId } = await createBoardWithList(owner.token);

    const helper = await createUser("Ajudante", "ajudante@example.com");
    await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: "ajudante@example.com", role: "MEMBER" });

    const doneCard = await createCard(owner.token, listId, "Concluído");
    await patchCard(owner.token, doneCard, {
      completedAt: new Date().toISOString(),
      assigneeId: owner.userId,
    });

    const overdueCard = await createCard(owner.token, listId, "Atrasado");
    await patchCard(owner.token, overdueCard, {
      dueDate: "2020-01-01T00:00:00.000Z",
      assigneeId: helper.userId,
    });

    await createCard(owner.token, listId, "Sem responsável");

    const response = await request(app)
      .get(`/api/boards/${boardId}/dashboard`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(200);
    expect(response.body.totalCards).toBe(3);
    expect(response.body.completedCards).toBe(1);
    expect(response.body.overdueCards).toBe(1);
    expect(response.body.completionRate).toBe(33);
    expect(response.body.completedByDay).toHaveLength(14);

    const byAssignee = response.body.cardsByAssignee as {
      assigneeId: string | null;
      count: number;
    }[];
    expect(byAssignee).toEqual(
      expect.arrayContaining([
        { assigneeId: owner.userId, count: 1 },
        { assigneeId: helper.userId, count: 1 },
        { assigneeId: null, count: 1 },
      ])
    );
  });

  it("retorna zeros quando o board não tem cards", async () => {
    const owner = await createUser("Dona do Board", "owner@example.com");
    const { boardId } = await createBoardWithList(owner.token);

    const response = await request(app)
      .get(`/api/boards/${boardId}/dashboard`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      totalCards: 0,
      completedCards: 0,
      overdueCards: 0,
      completionRate: 0,
      cardsByAssignee: [],
    });
  });

  it("deve retornar 404 quando o usuário não é membro do workspace do board", async () => {
    const owner = await createUser("Dona do Board", "owner@example.com");
    const { boardId } = await createBoardWithList(owner.token);
    const outsider = await createUser("De Fora", "fora@example.com");

    const response = await request(app)
      .get(`/api/boards/${boardId}/dashboard`)
      .set("Authorization", `Bearer ${outsider.token}`);

    expect(response.status).toBe(404);
  });

  it("deve retornar 401 quando nenhum token é informado", async () => {
    const owner = await createUser("Dona do Board", "owner@example.com");
    const { boardId } = await createBoardWithList(owner.token);

    const response = await request(app).get(`/api/boards/${boardId}/dashboard`);

    expect(response.status).toBe(401);
  });
});
