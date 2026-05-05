import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/auth';

  constructor(private readonly http: HttpClient) {}

  register(payload: RegisterPayload) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap((response) => this.saveSession(response)));
  }

  private saveSession(response: AuthResponse) {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }
}
