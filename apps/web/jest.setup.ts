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
