import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Request {
  id: string;
  professor: string;
  email: string;
  group: string;
  studentCount: number;
  date: string;
  schedule: string;
  purpose: string;
  submittedDate: string;
  faculty: string;
}

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requests.html',
  styleUrl: './requests.scss',
})
export class Requests {
  requests: Request[] = [
    {
      id: '1',
      professor: 'Dr. Juan Pérez',
      email: 'juan.perez@universidad.edu',
      group: 'Grupo A - Programación I',
      studentCount: 30,
      date: 'Lunes, 20 Mar 2026',
      schedule: '09:00 - 11:00',
      purpose: 'Práctica de desarrollo de aplicaciones web con React',
      submittedDate: '10 Mar 2026',
      faculty: 'Facultad de Ingeniería',
    },
    {
      id: '2',
      professor: 'Dra. María González',
      email: 'maria.gonzalez@universidad.edu',
      group: 'Grupo B - Bases de Datos',
      studentCount: 25,
      date: 'Martes, 21 Mar 2026',
      schedule: '14:00 - 16:00',
      purpose: 'Laboratorio de SQL y consultas complejas',
      submittedDate: '11 Mar 2026',
      faculty: 'Facultad de Ingeniería',
    },
    {
      id: '3',
      professor: 'Ing. Carlos Rodríguez',
      email: 'carlos.rodriguez@universidad.edu',
      group: 'Grupo C - Redes',
      studentCount: 28,
      date: 'Miércoles, 22 Mar 2026',
      schedule: '10:00 - 12:00',
      purpose: 'Configuración de switches y routers',
      submittedDate: '11 Mar 2026',
      faculty: 'Facultad de Ingeniería',
    },
  ];

  selectedRequest: Request | null = null;
  showDetailModal = false;

  handleApprove(id: string): void {
    console.log('Aprobar solicitud:', id);
    this.requests = this.requests.filter((r) => r.id !== id);
  }

  handleReject(id: string): void {
    console.log('Rechazar solicitud:', id);
    this.requests = this.requests.filter((r) => r.id !== id);
  }

  handleViewDetails(request: Request): void {
    this.selectedRequest = request;
    this.showDetailModal = true;
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedRequest = null;
  }
}
