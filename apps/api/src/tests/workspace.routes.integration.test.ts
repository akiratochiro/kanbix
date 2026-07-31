import request from "supertest";
import { app } from "../app";
import { prisma } from "../config/prisma";

afterEach(async () => {
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createAuthenticatedUser() {
  await request(app).post("/api/users").send({
    name: "Maria Silva",
    email: "maria@example.com",
    password: "senha12345",
  });

  const loginResponse = await request(app).post("/api/login").send({
    email: "maria@example.com",
    password: "senha12345",
  });

  return {
    token: loginResponse.body.token as string,
    userId: loginResponse.body.user.id as string,
  };
}

describe("POST /api/workspaces", () => {
  it("deve criar um workspace e retornar 201 com o DTO", async () => {
    const { token } = await createAuthenticatedUser();

    const response = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Meu Workspace", description: "Descrição de teste" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: "Meu Workspace",
      description: "Descrição de teste",
    });
  });

  it("deve criar automaticamente um WorkspaceMember com role OWNER para quem criou", async () => {
    const { token, userId } = await createAuthenticatedUser();

    const response = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Meu Workspace" });

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: response.body.id,
        },
      },
    });

    expect(membership).not.toBeNull();
    expect(membership?.role).toBe("OWNER");
  });

  it("deve retornar 401 quando nenhum token é informado", async () => {
    const response = await request(app)
      .post("/api/workspaces")
      .send({ name: "Meu Workspace" });

    expect(response.status).toBe(401);
  });

  it("deve retornar 400 quando o nome não é informado", async () => {
    const { token } = await createAuthenticatedUser();

    const response = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("deve ignorar um ownerId enviado no corpo da requisição, usando o do token", async () => {
    const { token, userId } = await createAuthenticatedUser();

    const response = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Meu Workspace", ownerId: "id-forjado-qualquer" });

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: response.body.id,
        },
      },
    });

    expect(membership).not.toBeNull();
  });
});