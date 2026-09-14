import request from "supertest";
import { app } from "../app";
import { prisma } from "../config/prisma";

afterEach(async () => {
  await prisma.label.deleteMany();
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createUserWithBoard() {
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

  return { token, boardId: boardResponse.body.id as string };
}

describe("POST /api/boards/:id/labels", () => {
  it("deve criar a label", async () => {
    const { token, boardId } = await createUserWithBoard();

    const response = await request(app)
      .post(`/api/boards/${boardId}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bug", color: "#EF4444" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: "Bug", color: "#EF4444", boardId });
  });

  it("deve retornar 400 quando a cor não está em formato hexadecimal válido", async () => {
    const { token, boardId } = await createUserWithBoard();

    const response = await request(app)
      .post(`/api/boards/${boardId}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bug", color: "vermelho" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 404 quando o board não existe", async () => {
    const { token } = await createUserWithBoard();

    const response = await request(app)
      .post("/api/boards/00000000-0000-0000-0000-000000000000/labels")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bug", color: "#EF4444" });

    expect(response.status).toBe(404);
  });
});

describe("GET /api/boards/:id/labels", () => {
  it("deve listar as labels do board", async () => {
    const { token, boardId } = await createUserWithBoard();

    await request(app)
      .post(`/api/boards/${boardId}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bug", color: "#EF4444" });
    await request(app)
      .post(`/api/boards/${boardId}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Urgente", color: "#F97316" });

    const response = await request(app)
      .get(`/api/boards/${boardId}/labels`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

describe("PATCH /api/labels/:id", () => {
  it("deve atualizar nome e cor da label", async () => {
    const { token, boardId } = await createUserWithBoard();

    const createResponse = await request(app)
      .post(`/api/boards/${boardId}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bug", color: "#EF4444" });

    const response = await request(app)
      .patch(`/api/labels/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bug crítico", color: "#DC2626" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: createResponse.body.id,
      name: "Bug crítico",
      color: "#DC2626",
    });
  });

  it("deve retornar 404 quando a label não existe", async () => {
    const { token } = await createUserWithBoard();

    const response = await request(app)
      .patch("/api/labels/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Novo nome" });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/labels/:id", () => {
  it("deve excluir a label", async () => {
    const { token, boardId } = await createUserWithBoard();

    const createResponse = await request(app)
      .post(`/api/boards/${boardId}/labels`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Bug", color: "#EF4444" });

    const response = await request(app)
      .delete(`/api/labels/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it("deve retornar 404 quando a label não existe", async () => {
    const { token } = await createUserWithBoard();

    const response = await request(app)
      .delete("/api/labels/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
