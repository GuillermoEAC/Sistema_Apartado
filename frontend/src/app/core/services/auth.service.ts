import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    correo: string;
    rol: 'profesor' | 'admin';
  };
}

interface RegisterPayload {
  nombre: string;
  apellido1: string;
  apellido2?: string;
  correo: string;
  password: string;
}

interface LoginPayload {
  correo: string;
  password: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/auth';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload) {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, payload)
      .pipe(map((response) => response.data))
      .pipe(tap((response) => this.saveSession(response)));
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, payload)
      .pipe(map((response) => response.data))
      .pipe(tap((response) => this.saveSession(response)));
  }

  private saveSession(response: AuthResponse) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
}
