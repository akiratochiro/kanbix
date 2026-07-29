import { userService } from "../services/user.service";
import { userRepository } from "../repositories/user.repository";
import { EmailAlreadyInUseError } from "../utils/errors";

jest.mock("../repositories/user.repository");
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password_mock"),
}));

const mockedUserRepository = userRepository as jest.Mocked<typeof userRepository>;

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
    expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith("maria@example.com");
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
      })
    ).rejects.toThrow(EmailAlreadyInUseError);

    expect(mockedUserRepository.create).not.toHaveBeenCalled();
  });
});