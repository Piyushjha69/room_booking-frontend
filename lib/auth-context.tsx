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
  signup: (email: string, password: string, name: string) => Promise<any>;
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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'user') {
        const storedUser = apiClient.getUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          setIsAdmin(storedUser.role === "ADMIN");
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await apiClient.login(email, password);
      const userData = response.user;
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === "ADMIN");
      return { ...response, user: userData };
    } catch (err) {
      const apiError = apiClient.handleError(err);
      setError(apiError.message);
      throw err;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const response = await apiClient.signup(email, password, name);
      const userData = response.user;
      setUser(userData);
      setIsAuthenticated(true);
      setIsAdmin(userData.role === "ADMIN");
      return { ...response, user: userData };
    } catch (err) {
      const apiError = apiClient.handleError(err);
      setError(apiError.message);
      throw err;
    }
  };

  const logout = async () => {
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
