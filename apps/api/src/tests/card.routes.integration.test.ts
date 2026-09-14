import request from "supertest";
import { app } from "../app";
import { prisma } from "../config/prisma";

afterEach(async () => {
  await prisma.card.deleteMany();
  await prisma.label.deleteMany();
  await prisma.list.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createUserWithList() {
  await request(app).post("/api/users").send({
    name: "Maria Silva",
    email: "maria@example.com",
    password: "senha12345",
  });
  const loginResponse = await request(app).post("/api/login").send({
    email: "maria@example.com",
    password: "senha12345",
  });
  const token = loginResponse.body.token as string;

  const workspaceResponse = await request(app)
    .post("/api/workspaces")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Workspace de Teste" });

  const boardResponse = await request(app)
    .post(`/api/workspaces/${workspaceResponse.body.id}/boards`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Board de Teste" });

  const listResponse = await request(app)
    .post(`/api/boards/${boardResponse.body.id}/lists`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "A Fazer" });

  return {
    token,
    listId: listResponse.body.id as string,
    boardId: boardResponse.body.id as string,
  };
}

describe("POST /api/lists/:id/cards", () => {
  it("deve criar o card com priority MEDIUM por padrão", async () => {
    const { token, listId } = await createUserWithList();

    const response = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Minha Tarefa" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ title: "Minha Tarefa", priority: "MEDIUM", listId });
  });

  it("deve retornar 400 quando o título está vazio", async () => {
    const { token, listId } = await createUserWithList();

    const response = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 404 quando a list não existe", async () => {
    const { token } = await createUserWithList();

    const response = await request(app)
      .post("/api/lists/00000000-0000-0000-0000-000000000000/cards")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "X" });

    expect(response.status).toBe(404);
  });
});

describe("GET /api/cards/:id", () => {
  it("deve retornar o card quando ele existe e o usuário tem acesso", async () => {
    const { token, listId } = await createUserWithList();

    const createResponse = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Minha Tarefa" });

    const response = await request(app)
      .get(`/api/cards/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ title: "Minha Tarefa", listId });
  });

  it("deve retornar 404 quando o card não existe", async () => {
    const { token } = await createUserWithList();

    const response = await request(app)
      .get("/api/cards/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it("deve retornar 404 quando o usuário não é membro do workspace do board", async () => {
    const { token, listId } = await createUserWithList();

    const createResponse = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Minha Tarefa" });

    await request(app).post("/api/users").send({
      name: "Outro Usuário",
      email: "outro@example.com",
      password: "senha12345",
    });
    const otherLogin = await request(app).post("/api/login").send({
      email: "outro@example.com",
      password: "senha12345",
    });
    const otherToken = otherLogin.body.token as string;

    const response = await request(app)
      .get(`/api/cards/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(response.status).toBe(404);
  });
});

describe("PATCH /api/cards/:id", () => {
  it("deve atualizar o título e a priority do card", async () => {
    const { token, listId } = await createUserWithList();

    const createResponse = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Minha Tarefa" });

    const response = await request(app)
      .patch(`/api/cards/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Atualizado", priority: "URGENT" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ title: "Atualizado", priority: "URGENT" });
  });

  it("deve marcar e depois reabrir um card", async () => {
    const { token, listId } = await createUserWithList();

    const createResponse = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Minha Tarefa" });

    const completedAt = "2026-03-10T12:00:00.000Z";
    const completeResponse = await request(app)
      .patch(`/api/cards/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completedAt });

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.completedAt).toBe(completedAt);

    const reopenResponse = await request(app)
      .patch(`/api/cards/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completedAt: null });

    expect(reopenResponse.status).toBe(200);
    expect(reopenResponse.body.completedAt).toBeNull();
  });

  it("deve mover o card para outra list", async () => {
    const { token, listId } = await createUserWithList();

    const createResponse = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Minha Tarefa" });

    const boardsResponse = await request(app)
      .get(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`);
    void boardsResponse;

    const secondListResponse = await request(app)
      .post(`/api/boards/${(await prisma.list.findUnique({ where: { id: listId } }))!.boardId}/lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Feito" });

    const response = await request(app)
      .patch(`/api/cards/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ listId: secondListResponse.body.id });

    expect(response.status).toBe(200);
    expect(response.body.listId).toBe(secondListResponse.body.id);
  });
});

describe("PATCH /api/cards/:id/move", () => {
  async function setupBoardWithTwoLists() {
    const { token, listId } = await createUserWithList();
    const boardId = (await prisma.list.findUnique({ where: { id: listId } }))!
      .boardId;

    const second = await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Feito" });

    return { token, listA: listId, listB: second.body.id as string };
  }

  async function createCard(token: string, listId: string, title: string) {
    const response = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title });
    return response.body.id as string;
  }

  async function titlesInOrder(token: string, listId: string) {
    const response = await request(app)
      .get(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`);
    return (response.body as { title: string; position: number }[]).map(
      (card) => card.title
    );
  }

  it("reordena os cards dentro da mesma lista", async () => {
    const { token, listA } = await setupBoardWithTwoLists();
    const first = await createCard(token, listA, "A");
    await createCard(token, listA, "B");
    await createCard(token, listA, "C");

    const response = await request(app)
      .patch(`/api/cards/${first}/move`)
      .set("Authorization", `Bearer ${token}`)
      .send({ toListId: listA, toIndex: 2 });

    expect(response.status).toBe(200);
    expect(await titlesInOrder(token, listA)).toEqual(["B", "C", "A"]);
  });

  it("move o card para outra lista no índice informado", async () => {
    const { token, listA, listB } = await setupBoardWithTwoLists();
    const moved = await createCard(token, listA, "A0");
    await createCard(token, listA, "A1");
    await createCard(token, listB, "B0");
    await createCard(token, listB, "B1");

    const response = await request(app)
      .patch(`/api/cards/${moved}/move`)
      .set("Authorization", `Bearer ${token}`)
      .send({ toListId: listB, toIndex: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ listId: listB, position: 1 });
    expect(await titlesInOrder(token, listB)).toEqual(["B0", "A0", "B1"]);
    expect(await titlesInOrder(token, listA)).toEqual(["A1"]);
  });

  it("retorna 404 quando o card não existe", async () => {
    const { token, listA } = await setupBoardWithTwoLists();

    const response = await request(app)
      .patch("/api/cards/00000000-0000-0000-0000-000000000000/move")
      .set("Authorization", `Bearer ${token}`)
      .send({ toListId: listA, toIndex: 0 });

    expect(response.status).toBe(404);
  });

  it("retorna 400 quando toIndex é negativo", async () => {
    const { token, listA } = await setupBoardWithTwoLists();
    const card = await createCard(token, listA, "A");

    const response = await request(app)
      .patch(`/api/cards/${card}/move`)
      .set("Authorization", `Bearer ${token}`)
      .send({ toListId: listA, toIndex: -1 });

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/cards/:id", () => {
  it("deve excluir o card", async () => {
    const { token, listId } = await createUserWithList();

    const createResponse = await request(app)
      .post(`/api/lists/${listId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Minha Tarefa" });

    const response = await request(app)
      .delete(`/api/cards/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });
});

async function createCardInList(token: string, listId: string, title: string) {
  const response = await request(app)
    .post(`/api/lists/${listId}/cards`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title });
  return response.body.id as string;
}

async function createLabel(token: string, boardId: string, name: string) {
  const response = await request(app)
    .post(`/api/boards/${boardId}/labels`)
    .set("Authorization", `Bearer ${token}`)
    .send({ name, color: "#EF4444" });
  return response.body.id as string;
}

describe("POST /api/cards/:id/labels", () => {
  it("deve anexar a label ao card", async () => {
    const { token, listId, boardId } = await createUserWithList();
    const card = await createCardInList(token, listId, "Minha Tarefa");
    const labelId = await createLabel(token, boardId, "Bug");

    const response = await request(app)
      .post(`/api/cards/${card}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ labelId });

    expect(response.status).toBe(200);
    expect(response.body.labels).toMatchObject([{ id: labelId, name: "Bug" }]);
  });

  it("anexar a mesma label duas vezes não duplica", async () => {
    const { token, listId, boardId } = await createUserWithList();
    const card = await createCardInList(token, listId, "Minha Tarefa");
    const labelId = await createLabel(token, boardId, "Bug");

    await request(app)
      .post(`/api/cards/${card}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ labelId });
    const response = await request(app)
      .post(`/api/cards/${card}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ labelId });

    expect(response.status).toBe(200);
    expect(response.body.labels).toHaveLength(1);
  });

  it("deve retornar 404 quando a label é de outro board", async () => {
    const { token, listId } = await createUserWithList();
    const card = await createCardInList(token, listId, "Minha Tarefa");

    const { boardId: outroBoardId } = await createUserWithList();
    const labelDeOutroBoard = await createLabel(token, outroBoardId, "Bug");

    const response = await request(app)
      .post(`/api/cards/${card}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ labelId: labelDeOutroBoard });

    expect(response.status).toBe(404);
  });

  it("deve retornar 404 quando o card não existe", async () => {
    const { token, boardId } = await createUserWithList();
    const labelId = await createLabel(token, boardId, "Bug");

    const response = await request(app)
      .post("/api/cards/00000000-0000-0000-0000-000000000000/labels")
      .set("Authorization", `Bearer ${token}`)
      .send({ labelId });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/cards/:id/labels/:labelId", () => {
  it("deve remover a label do card", async () => {
    const { token, listId, boardId } = await createUserWithList();
    const card = await createCardInList(token, listId, "Minha Tarefa");
    const labelId = await createLabel(token, boardId, "Bug");
    await request(app)
      .post(`/api/cards/${card}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ labelId });

    const response = await request(app)
      .delete(`/api/cards/${card}/labels/${labelId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.labels).toEqual([]);
  });
});