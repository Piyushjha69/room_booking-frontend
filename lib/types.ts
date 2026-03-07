export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  pricePerNight: number | string;
  hotelId: string;
  hotel?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomType {
  roomType: string;
  pricePerNight: number;
  availableRooms: number;
  hotelId: string;
  hotelName: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}
