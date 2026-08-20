import request from "supertest";
import { app } from "../app";
import { prisma } from "../config/prisma";

afterEach(async () => {
  await prisma.board.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createUserWithWorkspace() {
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

  return { token, workspaceId: workspaceResponse.body.id as string };
}

describe("POST /api/workspaces/:id/boards", () => {
  it("deve criar um board e retornar 201 com o DTO", async () => {
    const { token, workspaceId } = await createUserWithWorkspace();

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Meu Board" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: "Meu Board",
      workspaceId,
      color: "#3B82F6",
    });
  });

  it("deve retornar 400 quando a cor não está em formato hexadecimal válido", async () => {
    const { token, workspaceId } = await createUserWithWorkspace();

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Meu Board", color: "azul" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 404 quando o usuário não é membro do workspace", async () => {
    const { workspaceId } = await createUserWithWorkspace();

    await request(app).post("/api/users").send({
      name: "Outro Usuário",
      email: "outro@example.com",
      password: "senha12345",
    });
    const loginOutro = await request(app).post("/api/login").send({
      email: "outro@example.com",
      password: "senha12345",
    });

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${loginOutro.body.token}`)
      .send({ name: "Board Indevido" });

    expect(response.status).toBe(404);
  });
});

describe("GET /api/workspaces/:id/boards", () => {
  it("deve listar os boards do workspace", async () => {
    const { token, workspaceId } = await createUserWithWorkspace();

    await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Board 1" });

    await request(app)
      .post(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Board 2" });

    const response = await request(app)
      .get(`/api/workspaces/${workspaceId}/boards`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});