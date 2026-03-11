import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoutingTest } from "../../src/pages/RoutingTest";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("RoutingTest", () => {
  it("renders the route test form", () => {
    render(<RoutingTest />);
    expect(screen.getByText("Route Test")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Describe a task to route... e.g. 'fix a small CSS bug in the sidebar'")
    ).toBeInTheDocument();
    expect(screen.getByText("Resolve Route")).toBeInTheDocument();
  });

  it("resolves a route and displays result", async () => {
    render(<RoutingTest />);
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          ok: true,
          data: {
            model: "gpt-4o",
            category: "code-gen",
            category_label: "Code Generation",
            confidence: 0.92,
            preset_used: "ideal",
            is_skill: false,
            alternatives: [{ model: "claude-sonnet", category: "code-gen", confidence: 0.85 }]
          }
        })
    });

    await user.type(
      screen.getByPlaceholderText("Describe a task to route... e.g. 'fix a small CSS bug in the sidebar'"),
      "write a React component"
    );
    await user.click(screen.getByText("Resolve Route"));

    expect(await screen.findByText("gpt-4o")).toBeInTheDocument();
    expect(screen.getByText("92.0%")).toBeInTheDocument();
    expect(screen.getByText("Code Generation")).toBeInTheDocument();
    expect(screen.getByText("ideal")).toBeInTheDocument();
    expect(screen.getByText("claude-sonnet")).toBeInTheDocument();
  });

  it("displays error on resolve failure", async () => {
    render(<RoutingTest />);
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Qdrant unavailable" })
    });

    await user.type(
      screen.getByPlaceholderText("Describe a task to route... e.g. 'fix a small CSS bug in the sidebar'"),
      "test task"
    );
    await user.click(screen.getByText("Resolve Route"));

    expect(await screen.findByText("Qdrant unavailable")).toBeInTheDocument();
  });

  it("does not resolve with empty task", async () => {
    render(<RoutingTest />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Resolve Route"));
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
