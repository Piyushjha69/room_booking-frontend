import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthResponse, ApiError } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  private client: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            if (!this.tokenRefreshPromise) {
              this.tokenRefreshPromise = this.refreshAccessToken();
            }

            const newToken = await this.tokenRefreshPromise;
            this.tokenRefreshPromise = null;

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch {
            this.clearTokens();
            window.location.href = "/login";
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  private clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<{ data: AuthResponse }>("/auth/login", {
      email,
      password,
    });

    const { accessToken, refreshToken, user } = response.data.data;
    this.setTokens(accessToken, refreshToken);
    this.setUser(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await this.client.post<{ data: AuthResponse }>("/auth/register", {
      email,
      password,
      name,
    });

    const { accessToken, refreshToken, user } = response.data.data;
    this.setTokens(accessToken, refreshToken);
    this.setUser(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async logout(): Promise<void> {
    try {
      await this.client.post("/auth/logout");
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post<{ data: { accessToken: string } }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken }
    );

    const newAccessToken = response.data.data.accessToken;
    const currentRefreshToken = this.getRefreshToken();

    if (currentRefreshToken) {
      this.setTokens(newAccessToken, currentRefreshToken);
    }

    return newAccessToken;
  }

  private setUser(user: any): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  }

  getUser(): any {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        return error.response.data as ApiError;
      }
      return {
        message: error.message,
        code: error.code,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    return {
      message: "An unexpected error occurred",
    };
  }
}

export const apiClient = new ApiClient();
