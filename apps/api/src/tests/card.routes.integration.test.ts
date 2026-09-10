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

  return { token, listId: listResponse.body.id as string };
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