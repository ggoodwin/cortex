import { describe, it, expect, vi, beforeEach } from "vitest";
import { api, setToken, getToken } from "../../src/api/client";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  setToken(null);
});

describe("setToken / getToken", () => {
  it("stores and retrieves a token", () => {
    setToken("abc123");
    expect(getToken()).toBe("abc123");
    expect(localStorage.getItem("cortex_token")).toBe("abc123");
  });

  it("clears token when set to null", () => {
    setToken("abc123");
    setToken(null);
    expect(getToken()).toBeNull();
    expect(localStorage.getItem("cortex_token")).toBeNull();
  });
});

describe("api.get", () => {
  it("sends GET request with correct headers", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, data: "hello" })
    });

    const result = await api.get("/health");

    expect(mockFetch).toHaveBeenCalledWith("/api/health", {
      headers: { "Content-Type": "application/json" }
    });
    expect(result).toEqual({ ok: true, data: "hello" });
  });

  it("includes Authorization header when token is set", async () => {
    setToken("my-jwt");
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    await api.get("/health");

    expect(mockFetch).toHaveBeenCalledWith("/api/health", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer my-jwt"
      }
    });
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: "Unauthorized" })
    });

    await expect(api.get("/secret")).rejects.toThrow("Unauthorized");
  });

  it("uses status code in error when no error field", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({})
    });

    await expect(api.get("/broken")).rejects.toThrow("Request failed: 500");
  });
});

describe("api.post", () => {
  it("sends POST request with JSON body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true, data: { id: "1" } })
    });

    const result = await api.post("/memory", { content: "test" });

    expect(mockFetch).toHaveBeenCalledWith("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "test" })
    });
    expect(result).toEqual({ ok: true, data: { id: "1" } });
  });

  it("sends POST without body when none provided", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    await api.post("/action");

    expect(mockFetch).toHaveBeenCalledWith("/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: undefined
    });
  });
});

describe("api.put", () => {
  it("sends PUT request with JSON body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    await api.put("/routing/active", { name: "ideal" });

    expect(mockFetch).toHaveBeenCalledWith("/api/routing/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "ideal" })
    });
  });
});

describe("api.patch", () => {
  it("sends PATCH request with JSON body", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    await api.patch("/memory/123", { content: "updated" });

    expect(mockFetch).toHaveBeenCalledWith("/api/memory/123", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "updated" })
    });
  });
});

describe("api.delete", () => {
  it("sends DELETE request", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true })
    });

    await api.delete("/memory/123");

    expect(mockFetch).toHaveBeenCalledWith("/api/memory/123", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });
  });
});
