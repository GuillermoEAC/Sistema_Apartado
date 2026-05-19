import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  stats = {
    solicitudes_pendientes: 0,
    reservas_hoy: 0,
    bloqueos_activos: 0,
    usuarios_activos: 0,
  };

  loading = true;
  error = '';

  constructor(private readonly adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.adminApi.getDashboard().subscribe({
      next: (stats) => {
        this.stats = { ...this.stats, ...stats };
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el resumen administrativo.';
        this.loading = false;
      },
    });
  }
}
