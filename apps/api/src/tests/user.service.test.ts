import { userService } from "../services/user.service";
import { userRepository } from "../repositories/user.repository";
import { EmailAlreadyInUseError } from "../utils/errors";


jest.mock("../repositories/user.repository");
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password_mock"),
  compare: jest.fn(),
}));

const mockedUserRepository = userRepository as jest.Mocked<
  typeof userRepository
>;

describe("userService.createUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um usuário com sucesso quando o e-mail ainda não existe", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(null);
    mockedUserRepository.create.mockResolvedValue({
      id: "uuid-fake",
      name: "Maria Silva",
      email: "maria@example.com",
      passwordHash: "hashed_password_mock",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await userService.createUser({
      name: "Maria Silva",
      email: "maria@example.com",
      password: "senha123",
    });

    expect(result).toEqual({
      id: "uuid-fake",
      name: "Maria Silva",
      email: "maria@example.com",
      avatarUrl: null,
      createdAt: expect.any(String),
    });

    expect(result).not.toHaveProperty("passwordHash");
    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith(
      "maria@example.com",
    );
    expect(mockedUserRepository.create).toHaveBeenCalledWith({
      name: "Maria Silva",
      email: "maria@example.com",
      passwordHash: "hashed_password_mock",
    });
  });

  it("deve lançar EmailAlreadyInUseError quando o e-mail já está cadastrado", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue({
      id: "uuid-existente",
      name: "Usuário Existente",
      email: "maria@example.com",
      passwordHash: "algum_hash",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      userService.createUser({
        name: "Maria Silva",
        email: "maria@example.com",
        password: "senha123",
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);

    expect(mockedUserRepository.create).not.toHaveBeenCalled();
  });
});

import { InvalidCredentialsError } from "../utils/errors";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";

jest.mock("../utils/jwt", () => ({
  generateToken: jest.fn().mockReturnValue("fake-jwt-token"),
}));

describe("userService.login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar o usuário e um token quando as credenciais estão corretas", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue({
      id: "uuid-fake",
      name: "Maria Silva",
      email: "maria@example.com",
      passwordHash: "hashed_password_mock",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await userService.login({
      email: "maria@example.com",
      password: "senha-correta",
    });

    expect(result).toEqual({
      user: {
        id: "uuid-fake",
        name: "Maria Silva",
        email: "maria@example.com",
        avatarUrl: null,
        createdAt: expect.any(String),
      },
      token: "fake-jwt-token",
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "senha-correta",
      "hashed_password_mock",
    );
    expect(generateToken).toHaveBeenCalledWith("uuid-fake");
  });

  it("deve lançar InvalidCredentialsError quando o e-mail não existe", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      userService.login({
        email: "naoexiste@example.com",
        password: "qualquersenha",
      }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(generateToken).not.toHaveBeenCalled();
  });

  it("deve lançar InvalidCredentialsError quando a senha está incorreta", async () => {
    mockedUserRepository.findByEmail.mockResolvedValue({
      id: "uuid-fake",
      name: "Maria Silva",
      email: "maria@example.com",
      passwordHash: "hashed_password_mock",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      userService.login({
        email: "maria@example.com",
        password: "senha-errada",
      }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(generateToken).not.toHaveBeenCalled();
  });
});

import { UserNotFoundError } from "../utils/errors";

describe("userService.getUserById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar o DTO do usuário quando ele existe", async () => {
    mockedUserRepository.findById.mockResolvedValue({
      id: "uuid-fake",
      name: "Maria Silva",
      email: "maria@example.com",
      passwordHash: "hashed_password_mock",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await userService.getUserById("uuid-fake");

    expect(result).toEqual({
      id: "uuid-fake",
      name: "Maria Silva",
      email: "maria@example.com",
      avatarUrl: null,
      createdAt: expect.any(String),
    });
    expect(result).not.toHaveProperty("passwordHash");
    expect(mockedUserRepository.findById).toHaveBeenCalledWith("uuid-fake");
  });

  it("deve lançar UserNotFoundError quando o usuário não existe", async () => {
    mockedUserRepository.findById.mockResolvedValue(null);

    await expect(userService.getUserById("uuid-inexistente")).rejects.toThrow(
      UserNotFoundError
    );
  });
});
