import nextJest from "next/jest.js";

// Carrega next.config.ts e os .env no ambiente de teste, e aplica o
// mesmo transform (SWC) que o app usa.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/src/tests/**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  clearMocks: true,
};

export default createJestConfig(config);
