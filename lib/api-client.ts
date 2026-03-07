import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthResponse, ApiError } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  private client: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;
  private maxRetries = 2;

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

  private checkOnlineStatus(): boolean {
    return navigator.onLine;
  }

  private async requestWithRetry<T>(
    requestFn: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error: any) {
      // Don't retry on authentication errors or client errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw error;
      }

      // Don't retry on network offline errors
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      // Retry logic
      if (retries > 0 && (error.code === 'ERR_NETWORK' || error.response?.status >= 500)) {
        console.log(`Retrying request... (${this.maxRetries - retries + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (this.maxRetries - retries + 1))); // Exponential backoff
        return this.requestWithRetry(requestFn, retries - 1);
      }

      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    if (!this.checkOnlineStatus()) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const response = await this.requestWithRetry(async () => {
      return await this.client.post<{ data: AuthResponse }>("/auth/login", {
        email,
        password,
      });
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
    if (!this.checkOnlineStatus()) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const response = await this.requestWithRetry(async () => {
      return await this.client.post<{ data: AuthResponse }>("/auth/register", {
        email,
        password,
        name,
      });
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

  // Room API methods
  async getAllRooms(): Promise<any[]> {
    return this.requestWithRetry(async () => {
      const response = await this.client.get<{ data: any[] }>("/rooms");
      return response.data.data;
    });
  }

  async getRoomById(id: string): Promise<any> {
    return this.requestWithRetry(async () => {
      const response = await this.client.get<{ data: any }>(`/rooms/${id}`);
      return response.data.data;
    });
  }

  async getAvailableRooms(startDate: string, endDate: string): Promise<any[]> {
    return this.requestWithRetry(async () => {
      const response = await this.client.get<{ data: any[] }>("/rooms/available", {
        params: { startDate, endDate },
      });
      return response.data.data;
    });
  }

  async getAvailableRoomTypes(startDate?: string, endDate?: string, hotelId?: string): Promise<any[]> {
    return this.requestWithRetry(async () => {
      const params: any = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (hotelId) {
        params.hotelId = hotelId;
      }
      const response = await this.client.get<{ data: any[] }>("/rooms/types", { params });
      return response.data.data;
    });
  }

  // Booking API methods
  async createBooking(data: {
    roomType: string;
    hotelId: string;
    startDate: string;
    endDate: string;
  }): Promise<any> {
    if (!this.checkOnlineStatus()) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    const response = await this.requestWithRetry(async () => {
      return await this.client.post<{ data: any }>("/bookings", data);
    });

    return response.data.data;
  }

  async getUserBookings(): Promise<any[]> {
    return this.requestWithRetry(async () => {
      const response = await this.client.get<{ data: any[] }>("/bookings");
      return response.data.data;
    });
  }

  // Hotel API methods
  async getAllHotels(): Promise<any[]> {
    return this.requestWithRetry(async () => {
      const response = await this.client.get<{ data: any[] }>("/hotels");
      return response.data.data;
    });
  }

  async getHotelById(id: string): Promise<any> {
    return this.requestWithRetry(async () => {
      const response = await this.client.get<{ data: any }>(`/hotels/${id}`);
      return response.data.data;
    });
  }

  async getBookingById(id: string): Promise<any> {
    const response = await this.client.get<{ data: any }>(`/bookings/${id}`);
    return response.data.data;
  }

  async updateBooking(
    id: string,
    data: Partial<{
      startDate: string;
      endDate: string;
      bookingStatus: string;
    }>
  ): Promise<any> {
    const response = await this.client.patch<{ data: any }>(`/bookings/${id}`, data);
    return response.data.data;
  }

  async cancelBooking(id: string): Promise<any> {
    const response = await this.client.post<{ data: any }>(`/bookings/${id}/cancel`);
    return response.data.data;
  }

  async deleteBooking(id: string): Promise<void> {
    await this.client.delete(`/bookings/${id}`);
  }

  handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      // Network errors
      if (!error.response && error.code === 'ERR_NETWORK') {
        return {
          message: 'Network error. Please check your internet connection and try again.',
          code: 'NETWORK_ERROR',
        };
      }

      if (error.response?.data) {
        return error.response.data as ApiError;
      }

      // Timeout errors
      if (error.code === 'ECONNABORTED') {
        return {
          message: 'Request timeout. Please try again.',
          code: 'TIMEOUT',
        };
      }

      return {
        message: error.message || 'A network error occurred',
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
