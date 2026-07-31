export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class EmailAlreadyInUseError extends AppError {
  constructor(email: string) {
    super(`O e-mail "${email}" já está em uso.`, 409);
  }
}


export class InvalidCredentialsError extends AppError {
  constructor() {
    super("E-mail ou senha inválidos.", 401);
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super("Token inválido ou expirado.", 401);
  }
}

export class MissingTokenError extends AppError {
  constructor() {
    super("Token de autenticação não informado.", 401);
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super("Usuário não encontrado.", 404);
  }
}

export class WorkspaceNotFoundError extends AppError {
  constructor() {
    super("Workspace não encontrado.", 404);
  }
}

export class InsufficientPermissionError extends AppError {
  constructor() {
    super("Você não tem permissão suficiente para esta ação.", 403);
  }
}