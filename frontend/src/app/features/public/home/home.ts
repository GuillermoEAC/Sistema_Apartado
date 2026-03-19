import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FullCalendarModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private platformId = inject(PLATFORM_ID);

  esNavegador = isPlatformBrowser(this.platformId);

  calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    height: 'auto',
    locale: 'es',
    firstDay: 1,
    weekends: false,
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '01:00:00',
    nowIndicator: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,dayGridMonth',
    },
    buttonText: {
      today: 'Hoy',
      week: 'Semana',
      month: 'Mes',
    },
    events: [
      {
        title: 'Uso académico',
        start: '2026-03-20T08:00:00',
        end: '2026-03-20T10:00:00',
        color: '#3b82f6',
      },
      {
        title: 'Pendiente de aprobación',
        start: '2026-03-20T10:00:00',
        end: '2026-03-20T12:00:00',
        color: '#f59e0b',
      },
      {
        title: 'Horario bloqueado',
        start: '2026-03-20T12:00:00',
        end: '2026-03-20T14:00:00',
        color: '#ef4444',
      },
      {
        title: 'Uso académico',
        start: '2026-03-21T09:00:00',
        end: '2026-03-21T11:00:00',
        color: '#3b82f6',
      },
      {
        title: 'Pendiente de aprobación',
        start: '2026-03-22T11:00:00',
        end: '2026-03-22T13:00:00',
        color: '#f59e0b',
      },
    ],

    selectable: true,

    dateClick: (info: any) => {
      alert('Debes iniciar sesión para realizar una reserva');
    },

    select: (info: any) => {
      alert('Debes iniciar sesión para realizar una reserva');
    },

  };

}

