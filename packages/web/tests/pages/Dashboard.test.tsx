import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Dashboard } from "../../src/pages/Dashboard";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

function mockAllApiCalls(overrides?: {
  stats?: Record<string, unknown>;
  health?: Record<string, unknown>;
  active?: Record<string, unknown>;
}) {
  // /memory/stats
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
        ok: true,
        data: overrides?.stats ?? { total: 42, by_category: { code: 10 }, by_project: { cortex: 32 }, by_source: {} }
      })
  });
  // /health
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
        ok: true,
        data: overrides?.health ?? { status: "healthy", qdrant: "connected", uptime: 1234 }
      })
  });
  // /routing/active
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () =>
      Promise.resolve({
        ok: true,
        data: overrides?.active ?? { name: "ideal" }
      })
  });
}

describe("Dashboard", () => {
  it("renders the Dashboard heading", () => {
    mockAllApiCalls();
    render(<Dashboard />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows loading placeholders initially", () => {
    mockAllApiCalls();
    render(<Dashboard />);
    const dots = screen.getAllByText("...");
    expect(dots.length).toBeGreaterThan(0);
  });

  it("displays health, stats, and active preset after loading", async () => {
    mockAllApiCalls();
    render(<Dashboard />);

    await waitFor(() => expect(screen.getByText("connected")).toBeInTheDocument());
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("ideal")).toBeInTheDocument();
  });

  it("renders category breakdown", async () => {
    mockAllApiCalls();
    render(<Dashboard />);

    await waitFor(() => expect(screen.getByText("code")).toBeInTheDocument());
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders project breakdown", async () => {
    mockAllApiCalls();
    render(<Dashboard />);

    await waitFor(() => expect(screen.getByText("cortex")).toBeInTheDocument());
    expect(screen.getByText("32")).toBeInTheDocument();
  });
});
