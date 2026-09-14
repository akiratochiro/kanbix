// Matchers extras: toBeInTheDocument, toBeDisabled, toHaveValue, etc.
import "@testing-library/jest-dom";

// jsdom não implementa essas APIs do Pointer Events, usadas pelo Radix
// Select/AlertDialog ao abrir seu conteúdo em portal.
if (!window.HTMLElement.prototype.hasPointerCapture) {
  window.HTMLElement.prototype.hasPointerCapture = () => false;
}
if (!window.HTMLElement.prototype.scrollIntoView) {
  window.HTMLElement.prototype.scrollIntoView = () => {};
}

// console.error vira falha de teste: é assim que o React reporta nesting
// de HTML inválido (ex: <form> dentro de <form>), props erradas, warnings
// de act() etc. — sem isso, esse tipo de bug passa em silêncio pela suíte
// (foi exatamente o que aconteceu com o checklist, achado só testando no
// navegador de verdade). Ainda imprime a mensagem original antes de
// falhar, pra não perder a informação de debug.
let consoleErrorCalls: unknown[][] = [];

beforeEach(() => {
  consoleErrorCalls = [];
  jest.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    consoleErrorCalls.push(args);
    process.stderr.write(args.map(String).join(" ") + "\n");
  });
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
  if (consoleErrorCalls.length > 0) {
    const messages = consoleErrorCalls.map((call) => call.join(" ")).join("\n\n");
    throw new Error(
      `console.error foi chamado ${consoleErrorCalls.length}x durante o teste:\n\n${messages}`
    );
  }
});
