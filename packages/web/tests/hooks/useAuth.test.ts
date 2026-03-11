import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "../../src/hooks/useAuth";
import { setToken } from "../../src/api/client";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  setToken(null);
});

function mockAuthMe(data: { username: string; auth_enabled: boolean }) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ ok: true, data })
  });
}

function mockAuthMeFailure() {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: () => Promise.resolve({ error: "Unauthorized" })
  });
}

describe("useAuth", () => {
  it("starts in loading state", () => {
    mockAuthMe({ username: "greg", auth_enabled: true });
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it("sets username after successful auth check", async () => {
    mockAuthMe({ username: "greg", auth_enabled: true });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.username).toBe("greg");
    expect(result.current.authEnabled).toBe(true);
  });

  it("sets authEnabled true and username null on auth failure", async () => {
    mockAuthMeFailure();
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.username).toBeNull();
    expect(result.current.authEnabled).toBe(true);
  });

  it("login sets token and username", async () => {
    mockAuthMe({ username: "greg", auth_enabled: true });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true, data: { token: "jwt-token", username: "greg" } })
    });

    await act(async () => {
      await result.current.login("greg", "password123");
    });

    expect(result.current.username).toBe("greg");
    expect(localStorage.getItem("cortex_token")).toBe("jwt-token");
  });

  it("logout clears token and username", async () => {
    mockAuthMe({ username: "greg", auth_enabled: true });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.logout();
    });

    expect(result.current.username).toBeNull();
    expect(localStorage.getItem("cortex_token")).toBeNull();
  });

  it("hasToken reflects current token state", async () => {
    mockAuthMe({ username: "greg", auth_enabled: false });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasToken).toBe(false);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ok: true, data: { token: "t", username: "greg" } })
    });

    await act(async () => {
      await result.current.login("greg", "pass");
    });

    expect(result.current.hasToken).toBe(true);
  });
});
