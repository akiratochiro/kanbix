import request from "supertest";
import { app } from "../app";
import { prisma } from "../config/prisma";

describe("POST /api/users", () => {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("deve cadastrar um usuário e retornar 201 com o DTO, sem a senha", async () => {
    const response = await request(app).post("/api/users").send({
      name: "Maria Silva",
      email: "maria@example.com",
      password: "senha12345",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: "Maria Silva",
      email: "maria@example.com",
      avatarUrl: null,
    });
    expect(response.body).not.toHaveProperty("passwordHash");
    expect(response.body).not.toHaveProperty("password");
  });

  it("deve retornar 400 quando o e-mail tem formato inválido", async () => {
    const response = await request(app).post("/api/users").send({
      name: "Maria Silva",
      email: "email-invalido",
      password: "senha12345",
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ])
    );
  });

  it("deve retornar 409 ao tentar cadastrar um e-mail já existente", async () => {
    await request(app).post("/api/users").send({
      name: "Maria Silva",
      email: "maria@example.com",
      password: "senha12345",
    });

    const response = await request(app).post("/api/users").send({
      name: "Outra Maria",
      email: "maria@example.com",
      password: "outrasenha123",
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain("já está em uso");
  });
});

describe("POST /api/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/users").send({
      name: "Maria Silva",
      email: "maria@example.com",
      password: "senha12345",
    });
  });

  it("deve retornar 200 com o usuário e um token quando as credenciais são válidas", async () => {
    const response = await request(app).post("/api/login").send({
      email: "maria@example.com",
      password: "senha12345",
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      name: "Maria Silva",
      email: "maria@example.com",
    });
    expect(typeof response.body.token).toBe("string");
    expect(response.body.token.split(".")).toHaveLength(3);
  });

  it("deve retornar 401 quando o e-mail não existe", async () => {
    const response = await request(app).post("/api/login").send({
      email: "naoexiste@example.com",
      password: "qualquersenha",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("E-mail ou senha inválidos.");
  });

  it("deve retornar 401 quando a senha está incorreta", async () => {
    const response = await request(app).post("/api/login").send({
      email: "maria@example.com",
      password: "senha-errada",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("E-mail ou senha inválidos.");
  });
});

