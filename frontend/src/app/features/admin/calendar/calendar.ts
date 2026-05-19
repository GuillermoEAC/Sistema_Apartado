import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

interface Reservation {
  day: string;
  hour: string;
  professor: string;
  group: string;
  status: 'reserved' | 'pending' | 'blocked';
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {

  reservations: Reservation[] = [
    { day: 'Lunes', hour: '09:00', professor: 'Dr. Juan Pérez', group: 'Grupo A', status: 'reserved' },
    { day: 'Lunes', hour: '14:00', professor: 'Dra. María González', group: 'Grupo B', status: 'pending' },
    { day: 'Martes', hour: '10:00', professor: 'Ing. Carlos Rodríguez', group: 'Grupo C', status: 'reserved' },
    { day: 'Martes', hour: '15:00', professor: 'Sistema', group: 'Mantenimiento', status: 'blocked' },
    { day: 'Miércoles', hour: '08:00', professor: 'Dr. Juan Pérez', group: 'Grupo A', status: 'reserved' },
    { day: 'Miércoles', hour: '11:00', professor: 'Dra. Ana Martínez', group: 'Grupo D', status: 'pending' },
    { day: 'Jueves', hour: '09:00', professor: 'Ing. Roberto Silva', group: 'Grupo E', status: 'reserved' },
    { day: 'Viernes', hour: '10:00', professor: 'Dra. María González', group: 'Grupo B', status: 'reserved' },
    { day: 'Viernes', hour: '13:00', professor: 'Dr. Fernando López', group: 'Grupo F', status: 'pending' },
  ];

  // Semana ejemplo (ajústala si quieres)
  baseWeekDates: any = {
    'Lunes': '2026-03-16',
    'Martes': '2026-03-17',
    'Miércoles': '2026-03-18',
    'Jueves': '2026-03-19',
    'Viernes': '2026-03-20',
  };

  getColorByStatus(status: string): string {
    switch (status) {
      case 'reserved':
        return '#3b82f6'; // azul
      case 'pending':
        return '#f59e0b'; // amarillo
      case 'blocked':
        return '#ef4444'; // rojo
      default:
        return '#10b981'; // verde
    }
  }

  // Convertimos reservations[] a eventos FullCalendar
  getEvents() {
    return this.reservations.map((r) => {
      const date = this.baseWeekDates[r.day];
      const start = `${date}T${r.hour}:00`;

      // evento dura 1 hora
      const endHour = Number(r.hour.split(':')[0]) + 1;
      const end = `${date}T${endHour.toString().padStart(2, '0')}:00:00`;

      return {
        title: `${r.group} - ${r.professor}`,
        start: start,
        end: end,
        color: this.getColorByStatus(r.status),
      };
    });
  }

  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    height: 'auto',
    locale: 'es',
    firstDay: 1,
    weekends: false,
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
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

    events: this.getEvents(),

    eventClick: (info: any) => {
      alert(`Reserva: ${info.event.title}`);
    },
  };
}
