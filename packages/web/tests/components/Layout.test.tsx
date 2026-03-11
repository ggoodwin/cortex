import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Layout } from "../../src/components/Layout";

function renderLayout() {
  return render(
    <MemoryRouter>
      <Layout />
    </MemoryRouter>
  );
}

describe("Layout", () => {
  it("renders the Cortex heading", () => {
    renderLayout();
    expect(screen.getByText("Cortex")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    renderLayout();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Memory")).toBeInTheDocument();
    expect(screen.getByText("Routing")).toBeInTheDocument();
    expect(screen.getByText("Route Test")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("navigation links point to correct routes", () => {
    renderLayout();
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Memory").closest("a")).toHaveAttribute("href", "/memory");
    expect(screen.getByText("Routing").closest("a")).toHaveAttribute("href", "/routing");
    expect(screen.getByText("Route Test").closest("a")).toHaveAttribute("href", "/routing/test");
    expect(screen.getByText("Settings").closest("a")).toHaveAttribute("href", "/settings");
  });
});
