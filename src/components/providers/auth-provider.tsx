"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  clearSession,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
} from "@/lib/auth";
import { authService } from "@/services/auth.service";
import type { AuthSession, LoginInput } from "@/types/auth";
import type { User } from "@/types/user";
import { queryKeys } from "@/lib/query-keys";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthSession>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUserState] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const syncAuthState = useCallback(() => {
    const token = getAccessToken();
    if (!token) {
      queryClient.clear();
    }
    setUserState(getStoredUser());
    setIsAuthenticated(Boolean(token));
    return token;
  }, [queryClient]);

  const refreshSession = useCallback(async () => {
    const token = syncAuthState();

    if (!token) {
      setUserState(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.me();
      setStoredUser(currentUser);
      queryClient.setQueryData(queryKeys.currentUser, currentUser);
      setUserState(currentUser);
      setIsAuthenticated(true);
    } catch {
      clearSession();
      setUserState(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient, syncAuthState]);

  useEffect(() => {
    const syncAuth = () => {
      syncAuthState();
    };

    syncAuth();
    window.addEventListener("auth:changed", syncAuth);
    return () => window.removeEventListener("auth:changed", syncAuth);
  }, [syncAuthState]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshSession();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshSession]);

  async function login(input: LoginInput) {
    const session = await authService.login(input);
    setAccessToken(session.access_token);
    setIsAuthenticated(true);

    if (session.user) {
      setStoredUser(session.user);
      setUserState(session.user);
      queryClient.setQueryData(queryKeys.currentUser, session.user);
    } else {
      await refreshSession();
    }

    return session;
  }

  function logout() {
    clearSession();
    queryClient.clear();
    setUserState(null);
    setIsAuthenticated(false);
  }

  function setUser(userValue: User | null) {
    if (!userValue) {
      clearSession();
      setUserState(null);
      setIsAuthenticated(false);
      return;
    }

    setStoredUser(userValue);
    queryClient.setQueryData(queryKeys.currentUser, userValue);
    setUserState(userValue);
    setIsAuthenticated(true);
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshSession,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
