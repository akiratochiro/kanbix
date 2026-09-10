import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/theme-toggle";

const setTheme = jest.fn();
let resolvedTheme = "light";

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

describe("ThemeToggle", () => {
  it("alterna do claro para o escuro", async () => {
    resolvedTheme = "light";
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button", { name: /alternar tema/i }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("alterna do escuro para o claro", async () => {
    resolvedTheme = "dark";
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button", { name: /alternar tema/i }));

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
