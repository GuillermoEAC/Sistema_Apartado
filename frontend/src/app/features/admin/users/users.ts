import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Users implements OnInit {
  searchTerm = '';
  loading = true;
  error = '';

  users: User[] = [];
  filteredUsers: User[] = [];

  constructor(
    private readonly adminApi: AdminApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminApi.getUsers().subscribe({
      next: (response) => {
        this.users = response.data.map((user) => this.mapUser(user));
        this.applyFilter();
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = term
      ? this.users.filter(
          (user) =>
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.faculty.toLowerCase().includes(term)
        )
      : [...this.users];
    this.cdr.detectChanges();
  }

  toggleUserStatus(id: string): void {
    this.adminApi.toggleUser(id).subscribe({
      next: () => {
        this.users = this.users.map((u) =>
          u.id === id ? { ...u, active: !u.active } : u
        );
        this.applyFilter();
        this.error = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cambiar el estado del usuario.';
        this.cdr.detectChanges();
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
          this.users = this.users.filter((u) => u.id !== id);
          this.applyFilter();
          this.error = '';
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'No se pudo desactivar el usuario.';
          this.cdr.detectChanges();
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

  trackByUserId(index: number, user: User): string {
    return user.id;
  }
}
