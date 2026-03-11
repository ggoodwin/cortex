import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { MemorySearch } from "../../src/pages/MemorySearch";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

function renderMemorySearch() {
  return render(
    <MemoryRouter>
      <MemorySearch />
    </MemoryRouter>
  );
}

describe("MemorySearch", () => {
  it("renders the search form", () => {
    renderMemorySearch();
    expect(screen.getByText("Memory Search")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search memories semantically...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Category filter")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Project filter")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("performs a search and displays results", async () => {
    renderMemorySearch();
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          ok: true,
          data: [
            {
              id: "1",
              content: "React hooks best practices",
              category: "code",
              project: "cortex",
              tags: ["react", "hooks"],
              importance: 7,
              score: 0.95,
              created_at: "2025-01-01T00:00:00Z"
            }
          ]
        })
    });

    await user.type(screen.getByPlaceholderText("Search memories semantically..."), "react hooks");
    await user.click(screen.getByText("Search"));

    expect(await screen.findByText("React hooks best practices")).toBeInTheDocument();
    expect(screen.getByText("code")).toBeInTheDocument();
    expect(screen.getByText("#react")).toBeInTheDocument();
    expect(screen.getByText("#hooks")).toBeInTheDocument();
  });

  it("shows no results message when search returns empty", async () => {
    renderMemorySearch();
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true, data: [] })
    });

    await user.type(screen.getByPlaceholderText("Search memories semantically..."), "nonexistent");
    await user.click(screen.getByText("Search"));

    expect(await screen.findByText("No results found")).toBeInTheDocument();
  });

  it("does not search with empty query", async () => {
    renderMemorySearch();
    const user = userEvent.setup();

    await user.click(screen.getByText("Search"));

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
