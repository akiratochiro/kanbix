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

describe("POST /api/boards/:id/lists", () => {
  it("deve criar a list com position 0 quando é a primeira do board", async () => {
    const { token, boardId } = await createUserWithBoard();

    const response = await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "A Fazer" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: "A Fazer", position: 0, boardId });
  });

  it("deve incrementar a position a cada nova list", async () => {
    const { token, boardId } = await createUserWithBoard();

    await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "A Fazer" });

    const second = await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Em Progresso" });

    expect(second.body.position).toBe(1);
  });

  it("deve retornar 404 quando o board não existe", async () => {
    const { token } = await createUserWithBoard();

    const response = await request(app)
      .post("/api/boards/00000000-0000-0000-0000-000000000000/lists")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "A Fazer" });

    expect(response.status).toBe(404);
  });
});

describe("GET /api/boards/:id/lists", () => {
  it("deve listar as lists do board em ordem de position", async () => {
    const { token, boardId } = await createUserWithBoard();

    await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "A Fazer" });
    await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Feito" });

    const response = await request(app)
      .get(`/api/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].name).toBe("A Fazer");
  });
});

describe("DELETE /api/lists/:id", () => {
  it("deve excluir a list", async () => {
    const { token, boardId } = await createUserWithBoard();

    const createResponse = await request(app)
      .post(`/api/boards/${boardId}/lists`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "A Fazer" });

    const response = await request(app)
      .delete(`/api/lists/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it("deve retornar 404 quando a list não existe", async () => {
    const { token } = await createUserWithBoard();

    const response = await request(app)
      .delete("/api/lists/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});