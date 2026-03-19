import { Component } from '@angular/core';
import { ReservationsService } from '../../../core/services/reservations';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [],
  templateUrl: './request-form.html',
  styleUrl: './request-form.scss',
})
export class RequestFormComponent {
  constructor(private reservationsService: ReservationsService) { }

  enviarSolicitud() {
    this.reservationsService.add({
      id: Date.now(),
      title: 'Nueva solicitud',
      start: '2026-03-23T10:00:00',
      end: '2026-03-23T12:00:00',
      status: 'pending',
    });

    alert('Solicitud enviada correctamente');
  }
}