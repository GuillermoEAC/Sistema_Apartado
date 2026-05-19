import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../../core/services/admin-api.service';

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
export class Requests implements OnInit {
  requests: Request[] = [];

  selectedRequest: Request | null = null;
  showDetailModal = false;
  loading = true;
  error = '';

  constructor(private readonly adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.adminApi.getRequests('pendiente').subscribe({
      next: (response) => {
        this.requests = response.data.map((request) => this.mapRequest(request));
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las solicitudes.';
        this.loading = false;
      },
    });
  }

  handleApprove(id: string): void {
    this.adminApi.approveRequest(id).subscribe({
      next: () => {
        this.requests = this.requests.filter((r) => r.id !== id);
      },
      error: () => {
        this.error = 'No se pudo aprobar la solicitud.';
      },
    });
  }

  handleReject(id: string): void {
    const motivo = window.prompt('Motivo del rechazo:', 'Solicitud rechazada por administración') ?? '';
    if (!motivo.trim()) return;

    this.adminApi.rejectRequest(id, motivo).subscribe({
      next: () => {
        this.requests = this.requests.filter((r) => r.id !== id);
      },
      error: () => {
        this.error = 'No se pudo rechazar la solicitud.';
      },
    });
  }

  handleViewDetails(request: Request): void {
    this.selectedRequest = request;
    this.showDetailModal = true;
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedRequest = null;
  }

  private mapRequest(request: any): Request {
    const usuario = request.usuario ?? {};
    const professor = [usuario.nombre, usuario.apellido1, usuario.apellido2].filter(Boolean).join(' ') || 'Profesor';

    return {
      id: String(request.id_solicitud),
      professor,
      email: usuario.correo ?? 'Sin correo',
      group: `${request.grupo ?? 'Sin grupo'}${request.materia ? ` - ${request.materia}` : ''}`,
      studentCount: Number(request.num_alumnos ?? 0),
      date: this.formatDate(request.fecha_uso),
      schedule: `${this.formatHour(request.hora_inicio)} - ${this.formatHour(request.hora_fin)}`,
      purpose: request.motivo ?? 'Sin motivo indicado',
      submittedDate: this.formatDate(request.created_at),
      faculty: usuario.facultad ?? request.centro?.nombre ?? 'Sin facultad',
    };
  }

  private formatDate(value: string): string {
    if (!value) return 'Sin fecha';
    return new Date(value).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private formatHour(value: string): string {
    return value?.slice(0, 5) ?? '--:--';
  }
}
