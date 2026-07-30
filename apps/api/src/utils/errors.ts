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