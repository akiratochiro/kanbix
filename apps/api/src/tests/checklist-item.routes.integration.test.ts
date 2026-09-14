import request from "supertest";
import { app } from "../app";
import { prisma } from "../config/prisma";

afterEach(async () => {
  await prisma.checklistItem.deleteMany();
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

async function createUserWithCard() {
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

  const cardResponse = await request(app)
    .post(`/api/lists/${listResponse.body.id}/cards`)
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Minha Tarefa" });

  return { token, cardId: cardResponse.body.id as string };
}

describe("POST /api/cards/:id/checklist-items", () => {
  it("deve criar o item com position 0 quando é o primeiro do card", async () => {
    const { token, cardId } = await createUserWithCard();

    const response = await request(app)
      .post(`/api/cards/${cardId}/checklist-items`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Escrever testes" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      text: "Escrever testes",
      completed: false,
      position: 0,
      cardId,
    });
  });

  it("deve incrementar a position a cada novo item", async () => {
    const { token, cardId } = await createUserWithCard();

    await request(app)
      .post(`/api/cards/${cardId}/checklist-items`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Item 1" });
    const second = await request(app)
      .post(`/api/cards/${cardId}/checklist-items`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Item 2" });

    expect(second.body.position).toBe(1);
  });

  it("deve retornar 400 quando o texto está vazio", async () => {
    const { token, cardId } = await createUserWithCard();

    const response = await request(app)
      .post(`/api/cards/${cardId}/checklist-items`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "" });

    expect(response.status).toBe(400);
  });

  it("deve retornar 404 quando o card não existe", async () => {
    const { token } = await createUserWithCard();

    const response = await request(app)
      .post("/api/cards/00000000-0000-0000-0000-000000000000/checklist-items")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "X" });

    expect(response.status).toBe(404);
  });
});

describe("GET /api/cards/:id/checklist-items", () => {
  it("deve listar os itens do card em ordem de position", async () => {
    const { token, cardId } = await createUserWithCard();

    await request(app)
      .post(`/api/cards/${cardId}/checklist-items`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Item 1" });
    await request(app)
      .post(`/api/cards/${cardId}/checklist-items`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Item 2" });

    const response = await request(app)
      .get(`/api/cards/${cardId}/checklist-items`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].text).toBe("Item 1");
  });
});

describe("PATCH /api/checklist-items/:id", () => {
  it("deve marcar o item como concluído e refletir no resumo do card", async () => {
    const { token, cardId } = await createUserWithCard();

    const createResponse = await request(app)
      .post(`/api/cards/${cardId}/checklist-items`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Item 1" });

    const response = await request(app)
      .patch(`/api/checklist-items/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });

    expect(response.status).toBe(200);
    expect(response.body.completed).toBe(true);

    const cardResponse = await request(app)
      .get(`/api/cards/${cardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(cardResponse.body.checklist).toEqual({ total: 1, completed: 1 });
  });

  it("deve retornar 404 quando o item não existe", async () => {
    const { token } = await createUserWithCard();

    const response = await request(app)
      .patch("/api/checklist-items/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/checklist-items/:id", () => {
  it("deve excluir o item", async () => {
    const { token, cardId } = await createUserWithCard();

    const createResponse = await request(app)
      .post(`/api/cards/${cardId}/checklist-items`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Item 1" });

    const response = await request(app)
      .delete(`/api/checklist-items/${createResponse.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it("deve retornar 404 quando o item não existe", async () => {
    const { token } = await createUserWithCard();

    const response = await request(app)
      .delete("/api/checklist-items/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
