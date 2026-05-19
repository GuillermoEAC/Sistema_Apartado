import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TeacherApiService } from '../../../core/services/teacher-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {

  nombreUsuario: string = 'Usuario';
  stats = {
    reservas_activas: 0,
    solicitudes_pendientes: 0,
    total_solicitudes: 0,
    total_reservas: 0,
  };
  loading = true;
  error = '';

  constructor(
    private readonly teacherApi: TeacherApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (typeof localStorage === 'undefined') {
      this.loadStats();
      return;
    }

    const sesion = localStorage.getItem('usuario') || localStorage.getItem('user');

    if (sesion) {
      try {
        const datosUsuario = JSON.parse(sesion);
        this.nombreUsuario = datosUsuario.nombre || datosUsuario.name || 'Usuario';
      } catch {
        this.nombreUsuario = 'Usuario';
      }
    }

    this.loadStats();
  }

  private loadStats(): void {
    this.teacherApi.getDashboard().subscribe({
      next: (stats) => {
        this.stats = { ...this.stats, ...stats };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar tu resumen.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

}
