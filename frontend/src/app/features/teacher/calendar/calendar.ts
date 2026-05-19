import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import esLocale from '@fullcalendar/core/locales/es';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent {

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek', // O 'dayGridMonth' si prefieres que inicie en mes
    plugins: [dayGridPlugin, timeGridPlugin],
    // 2. APLICA EL IDIOMA AQUÍ
    locale: esLocale,
    height: 700,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,dayGridMonth'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    events: [
      { title: 'Reserva 1', date: new Date().toISOString().split('T')[0] + 'T08:00:00', color: '#3b82f6' }
    ]
  };
}