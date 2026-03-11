import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Login } from "../../src/pages/Login";

describe("Login", () => {
  const onLogin = vi.fn();
  const onSetup = vi.fn();

  function renderLogin() {
    return render(<Login onLogin={onLogin} onSetup={onSetup} />);
  }

  it("renders the login form", () => {
    renderLogin();
    expect(screen.getByText("Cortex")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("calls onLogin with username and password on submit", async () => {
    onLogin.mockResolvedValue(undefined);
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Username"), "greg");
    await user.type(screen.getByPlaceholderText("Password"), "secret");
    await user.click(screen.getByText("Login"));

    expect(onLogin).toHaveBeenCalledWith("greg", "secret");
  });

  it("toggles to setup mode", async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByText("First time? Create account"));
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByText("Already have an account? Login")).toBeInTheDocument();
  });

  it("calls onSetup in setup mode", async () => {
    onSetup.mockResolvedValue(undefined);
    renderLogin();
    const user = userEvent.setup();

    await user.click(screen.getByText("First time? Create account"));
    await user.type(screen.getByPlaceholderText("Username"), "newuser");
    await user.type(screen.getByPlaceholderText("Password"), "pass123");
    await user.click(screen.getByText("Create Account"));

    expect(onSetup).toHaveBeenCalledWith("newuser", "pass123");
  });

  it("displays error on login failure", async () => {
    onLogin.mockRejectedValue(new Error("Invalid credentials"));
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("Username"), "greg");
    await user.type(screen.getByPlaceholderText("Password"), "wrong");
    await user.click(screen.getByText("Login"));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
