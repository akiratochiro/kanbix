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

async function createUser(name: string, email: string) {
  await request(app)
    .post("/api/users")
    .send({ name, email, password: "senha12345" });

  const login = await request(app)
    .post("/api/login")
    .send({ email, password: "senha12345" });

  return { token: login.body.token as string, userId: login.body.user.id as string };
}

async function createWorkspaceWithOwner() {
  const owner = await createUser("Dona do Workspace", "owner@example.com");

  const create = await request(app)
    .post("/api/workspaces")
    .set("Authorization", `Bearer ${owner.token}`)
    .send({ name: "Workspace Teste" });

  return { owner, workspaceId: create.body.id as string };
}

async function addMemberDirectly(workspaceId: string, userId: string, role: "ADMIN" | "MEMBER") {
  await prisma.workspaceMember.create({ data: { workspaceId, userId, role } });
}

describe("GET /api/workspaces/:id/members", () => {
  it("deve listar os membros do workspace", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app)
      .get(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      userId: owner.userId,
      role: "OWNER",
      email: "owner@example.com",
    });
  });

  it("deve retornar 404 quando o usuário não é membro do workspace", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();
    const outsider = await createUser("De Fora", "fora@example.com");

    const response = await request(app)
      .get(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${outsider.token}`);

    expect(response.status).toBe(404);
  });

  it("deve retornar 401 quando nenhum token é informado", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app).get(`/api/workspaces/${workspaceId}/members`);

    expect(response.status).toBe(401);
  });
});

describe("POST /api/workspaces/:id/members", () => {
  it("deve adicionar um usuário existente como membro quando quem convida é OWNER", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();
    const invited = await createUser("Convidada", "convidada@example.com");

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: "convidada@example.com", role: "MEMBER" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ userId: invited.userId, role: "MEMBER" });
  });

  it("deve permitir que um ADMIN convide novos membros", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();
    const admin = await createUser("Admin", "admin@example.com");
    await addMemberDirectly(workspaceId, admin.userId, "ADMIN");
    const invited = await createUser("Convidada", "convidada@example.com");

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ email: "convidada@example.com", role: "MEMBER" });

    expect(response.status).toBe(201);
    expect(response.body.userId).toBe(invited.userId);
  });

  it("deve retornar 403 quando quem convida é MEMBER", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();
    const member = await createUser("Membro", "membro@example.com");
    await addMemberDirectly(workspaceId, member.userId, "MEMBER");
    await createUser("Convidada", "convidada@example.com");

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${member.token}`)
      .send({ email: "convidada@example.com", role: "MEMBER" });

    expect(response.status).toBe(403);
  });

  it("deve retornar 404 quando o e-mail não corresponde a nenhum usuário", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: "ninguem@example.com", role: "MEMBER" });

    expect(response.status).toBe(404);
  });

  it("deve retornar 409 quando o usuário já é membro", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: "owner@example.com", role: "MEMBER" });

    expect(response.status).toBe(409);
  });

  it("deve retornar 400 quando o role informado é OWNER", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();
    await createUser("Convidada", "convidada@example.com");

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ email: "convidada@example.com", role: "OWNER" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 401 quando nenhum token é informado", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .send({ email: "convidada@example.com", role: "MEMBER" });

    expect(response.status).toBe(401);
  });
});

describe("PATCH /api/workspaces/:id/members/:userId", () => {
  it("deve permitir que o OWNER troque o papel de um membro", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();
    const member = await createUser("Membro", "membro@example.com");
    await addMemberDirectly(workspaceId, member.userId, "MEMBER");

    const response = await request(app)
      .patch(`/api/workspaces/${workspaceId}/members/${member.userId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ role: "ADMIN" });

    expect(response.status).toBe(200);
    expect(response.body.role).toBe("ADMIN");
  });

  it("deve retornar 403 quando quem tenta trocar o papel é ADMIN (não OWNER)", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();
    const admin = await createUser("Admin", "admin@example.com");
    await addMemberDirectly(workspaceId, admin.userId, "ADMIN");
    const member = await createUser("Membro", "membro@example.com");
    await addMemberDirectly(workspaceId, member.userId, "MEMBER");

    const response = await request(app)
      .patch(`/api/workspaces/${workspaceId}/members/${member.userId}`)
      .set("Authorization", `Bearer ${admin.token}`)
      .send({ role: "ADMIN" });

    expect(response.status).toBe(403);
  });

  it("deve retornar 409 ao tentar rebaixar o único Dono", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app)
      .patch(`/api/workspaces/${workspaceId}/members/${owner.userId}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ role: "ADMIN" });

    expect(response.status).toBe(409);
  });

  it("deve retornar 404 quando o userId não é membro do workspace", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app)
      .patch(`/api/workspaces/${workspaceId}/members/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ role: "ADMIN" });

    expect(response.status).toBe(404);
  });

  it("deve retornar 401 quando nenhum token é informado", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app)
      .patch(`/api/workspaces/${workspaceId}/members/qualquer-id`)
      .send({ role: "ADMIN" });

    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/workspaces/:id/members/:userId", () => {
  it("deve permitir que um ADMIN remova um MEMBER", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();
    const admin = await createUser("Admin", "admin@example.com");
    await addMemberDirectly(workspaceId, admin.userId, "ADMIN");
    const member = await createUser("Membro", "membro@example.com");
    await addMemberDirectly(workspaceId, member.userId, "MEMBER");

    const response = await request(app)
      .delete(`/api/workspaces/${workspaceId}/members/${member.userId}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(response.status).toBe(204);
  });

  it("não deve permitir que um ADMIN remova outro ADMIN", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();
    const admin = await createUser("Admin", "admin@example.com");
    await addMemberDirectly(workspaceId, admin.userId, "ADMIN");
    const otherAdmin = await createUser("Outro Admin", "outroadmin@example.com");
    await addMemberDirectly(workspaceId, otherAdmin.userId, "ADMIN");

    const response = await request(app)
      .delete(`/api/workspaces/${workspaceId}/members/${otherAdmin.userId}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(response.status).toBe(403);
  });

  it("não deve permitir que um ADMIN remova o OWNER", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();
    const admin = await createUser("Admin", "admin@example.com");
    await addMemberDirectly(workspaceId, admin.userId, "ADMIN");

    const response = await request(app)
      .delete(`/api/workspaces/${workspaceId}/members/${owner.userId}`)
      .set("Authorization", `Bearer ${admin.token}`);

    expect(response.status).toBe(403);
  });

  it("deve retornar 409 ao tentar remover o único Dono", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app)
      .delete(`/api/workspaces/${workspaceId}/members/${owner.userId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(409);
  });

  it("deve retornar 404 quando o userId não é membro do workspace", async () => {
    const { owner, workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app)
      .delete(`/api/workspaces/${workspaceId}/members/00000000-0000-0000-0000-000000000000`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(404);
  });

  it("deve retornar 401 quando nenhum token é informado", async () => {
    const { workspaceId } = await createWorkspaceWithOwner();

    const response = await request(app).delete(
      `/api/workspaces/${workspaceId}/members/qualquer-id`
    );

    expect(response.status).toBe(401);
  });
});
