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