import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
export class Users {
  searchTerm = '';

  users: User[] = [
    {
      id: '1',
      name: 'Dr. Juan Pérez',
      email: 'juan.perez@universidad.edu',
      faculty: 'Facultad de Ingeniería',
      active: true,
      reservationCount: 12,
      joinedDate: 'Ene 2025',
    },
    {
      id: '2',
      name: 'Dra. María González',
      email: 'maria.gonzalez@universidad.edu',
      faculty: 'Facultad de Ingeniería',
      active: true,
      reservationCount: 8,
      joinedDate: 'Feb 2025',
    },
    {
      id: '3',
      name: 'Ing. Carlos Rodríguez',
      email: 'carlos.rodriguez@universidad.edu',
      faculty: 'Facultad de Ingeniería',
      active: true,
      reservationCount: 15,
      joinedDate: 'Dic 2024',
    },
    {
      id: '4',
      name: 'Dra. Ana Martínez',
      email: 'ana.martinez@universidad.edu',
      faculty: 'Facultad de Ciencias',
      active: true,
      reservationCount: 6,
      joinedDate: 'Mar 2025',
    },
    {
      id: '5',
      name: 'Dr. Roberto Silva',
      email: 'roberto.silva@universidad.edu',
      faculty: 'Facultad de Ingeniería',
      active: false,
      reservationCount: 3,
      joinedDate: 'Nov 2024',
    },
  ];

  get filteredUsers(): User[] {
    return this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.faculty.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  toggleUserStatus(id: string): void {
    this.users = this.users.map((user) =>
      user.id === id
        ? { ...user, active: !user.active }
        : user
    );
  }

  handleDeleteUser(id: string): void {
    const confirmDelete = confirm(
      '¿Está seguro de eliminar este usuario?'
    );

    if (confirmDelete) {
      this.users = this.users.filter((user) => user.id !== id);
    }
  }
}
