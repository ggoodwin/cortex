import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Settings } from "../../src/pages/Settings";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("Settings", () => {
  it("renders the Settings heading", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ ok: true, data: { status: "healthy", qdrant: "connected", uptime: 100, collections: {} } })
    });
    render(<Settings />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ ok: true, data: { status: "healthy", qdrant: "connected", uptime: 100, collections: {} } })
    });
    render(<Settings />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays health data after loading", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          ok: true,
          data: {
            status: "healthy",
            qdrant: "connected",
            uptime: 3600,
            collections: { cortex_memories: { points: 150 } }
          }
        })
    });
    render(<Settings />);

    await waitFor(() => expect(screen.getByText("healthy")).toBeInTheDocument());
    expect(screen.getByText("connected")).toBeInTheDocument();
    expect(screen.getByText("3600s")).toBeInTheDocument();
    expect(screen.getByText("cortex_memories")).toBeInTheDocument();
    expect(screen.getByText("150 points")).toBeInTheDocument();
  });

  it("renders API info section", () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ ok: true, data: { status: "healthy", qdrant: "connected", uptime: 100, collections: {} } })
    });
    render(<Settings />);
    expect(screen.getByText("API Info")).toBeInTheDocument();
  });
});
