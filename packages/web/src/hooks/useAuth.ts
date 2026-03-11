import { useState, useEffect, useCallback } from "react";
import { api, setToken, getToken } from "../api/client";

interface AuthState {
  username: string | null;
  authEnabled: boolean;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    username: null,
    authEnabled: false,
    loading: true
  });

  const checkAuth = useCallback(async (retries = 3) => {
    try {
      const res = await api.get<{ ok: boolean; data: { username: string; auth_enabled: boolean } }>("/auth/me");
      setState({
        username: res.data.username,
        authEnabled: res.data.auth_enabled,
        loading: false
      });
    } catch (err: unknown) {
      // Network error (backend not ready yet) — retry
      const isNetworkError = err instanceof TypeError;
      if (isNetworkError && retries > 0) {
        setTimeout(() => checkAuth(retries - 1), 1000);
        return;
      }
      setState({ username: null, authEnabled: true, loading: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const res = await api.post<{ ok: boolean; data: { token: string; username: string } }>("/auth/login", {
      username,
      password
    });
    setToken(res.data.token);
    setState(s => ({ ...s, username: res.data.username }));
  };

  const setup = async (username: string, password: string) => {
    const res = await api.post<{ ok: boolean; data: { token: string; username: string } }>("/auth/setup", {
      username,
      password
    });
    setToken(res.data.token);
    setState(s => ({ ...s, username: res.data.username }));
  };

  const logout = () => {
    setToken(null);
    setState(s => ({ ...s, username: null }));
  };

  return { ...state, login, setup, logout, checkAuth, hasToken: !!getToken() };
}
