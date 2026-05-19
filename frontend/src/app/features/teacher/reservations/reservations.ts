import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TeacherApiService } from '../../../core/services/teacher-api.service';

interface ReservationView {
  id: string;
  type: 'solicitud' | 'reserva';
  title: string;
  details: string;
  status: string;
}

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class Reservations implements OnInit {
  items: ReservationView[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly teacherApi: TeacherApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.error = '';

    this.teacherApi.getMyRequests().subscribe({
      next: (requests) => {
        const requestItems = requests.data.map((request) => this.mapRequest(request));

        this.teacherApi.getMyReservations().subscribe({
          next: (reservations) => {
            const reservationItems = reservations.data.map((reservation) => this.mapReservation(reservation));
            this.items = [...requestItems, ...reservationItems];
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => this.failLoad(),
        });
      },
      error: () => this.failLoad(),
    });
  }

  cancel(item: ReservationView): void {
    if (!confirm('¿Seguro que deseas cancelar este registro?')) return;

    const action = item.type === 'solicitud'
      ? this.teacherApi.cancelRequest(item.id)
      : this.teacherApi.cancelReservation(item.id);

    action.subscribe({
      next: () => this.loadItems(),
      error: () => {
        this.error = 'No se pudo cancelar el registro.';
        this.cdr.detectChanges();
      },
    });
  }

  private mapRequest(request: any): ReservationView {
    return {
      id: String(request.id_solicitud),
      type: 'solicitud',
      title: request.materia ?? 'Solicitud',
      details: `${request.grupo ?? 'Sin grupo'} · ${this.formatDate(request.fecha_uso)} · ${this.formatHour(request.hora_inicio)} a ${this.formatHour(request.hora_fin)}`,
      status: request.estado,
    };
  }

  private mapReservation(reservation: any): ReservationView {
    const solicitud = reservation.solicitud ?? {};

    return {
      id: String(reservation.id_reserva),
      type: 'reserva',
      title: solicitud.materia ?? 'Reserva',
      details: `${solicitud.grupo ?? 'Sin grupo'} · ${this.formatDate(reservation.fecha_uso)} · ${this.formatHour(reservation.hora_inicio)} a ${this.formatHour(reservation.hora_fin)}`,
      status: reservation.estado,
    };
  }

  private failLoad(): void {
    this.error = 'No se pudieron cargar tus solicitudes y reservas.';
    this.loading = false;
    this.cdr.detectChanges();
  }

  private formatDate(value: string): string {
    if (!value) return 'Sin fecha';
    return new Date(value).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private formatHour(value: string): string {
    return value?.slice(0, 5) ?? '--:--';
  }
}
