"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "./types";
import { apiClient } from "./api-client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      try {
        if (apiClient.isAuthenticated()) {
          const storedUser = apiClient.getUser();
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
            setIsAdmin(storedUser.role === "ADMIN");
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      setIsAdmin(response.user.role === "ADMIN");
      return response;
    } catch (err) {
      const apiError = apiClient.handleError(err);
      setError(apiError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.signup(email, password, name);
      setUser(response.user);
      setIsAuthenticated(true);
      setIsAdmin(response.user.role === "ADMIN");
    } catch (err) {
      const apiError = apiClient.handleError(err);
      setError(apiError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setError(null);
    } catch (err) {
      const apiError = apiClient.handleError(err);
      setError(apiError.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isAdmin,
        login,
        signup,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
