import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';

interface User {
  id: string;
  name: string;
  email: string;
  faculty: string;
  active: boolean;
  reservationCount: number;
  joinedDate: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  searchTerm = '';
  loading = true;
  error = '';

  users: User[] = [];

  constructor(private readonly adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminApi.getUsers().subscribe({
      next: (response) => {
        this.users = response.data.map((user) => this.mapUser(user));
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios.';
        this.loading = false;
      },
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.faculty.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleUserStatus(id: string): void {
    this.adminApi.toggleUser(id).subscribe({
      next: () => {
        this.users = this.users.map((user) =>
          user.id === id ? { ...user, active: !user.active } : user
        );
      },
      error: () => {
        this.error = 'No se pudo cambiar el estado del usuario.';
      },
    });
  }

  handleDeleteUser(id: string): void {
    const confirmDelete = confirm(
      '¿Está seguro de eliminar este usuario?'
    );

    if (confirmDelete) {
      this.adminApi.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter((user) => user.id !== id);
        },
        error: () => {
          this.error = 'No se pudo desactivar el usuario.';
        },
      });
    }
  }

  private mapUser(user: any): User {
    const view = user.admin_view;
    if (view) {
      return {
        ...view,
        joinedDate: this.formatDate(view.joinedDate),
      };
    }

    return {
      id: String(user.id_usuario),
      name: [user.nombre, user.apellido1, user.apellido2].filter(Boolean).join(' '),
      email: user.correo,
      faculty: user.facultad ?? 'Sin facultad',
      active: Boolean(user.activo),
      reservationCount: Number(user.reservation_count ?? 0),
      joinedDate: this.formatDate(user.created_at),
    };
  }

  private formatDate(value: string): string {
    if (!value) return 'Sin fecha';
    return new Date(value).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
    });
  }
}
