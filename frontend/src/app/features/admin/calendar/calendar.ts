import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { AdminApiService } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {
  @ViewChild(FullCalendarComponent) calendar?: FullCalendarComponent;

  loading = true;
  error = '';

  constructor(
    private readonly adminApi: AdminApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  calendarOptions: any = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    height: 'auto',
    locale: 'es',
    firstDay: 1,
    weekends: false,
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '24:00:00',
    slotDuration: '01:00:00',
    scrollTime: '07:00:00',
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

    events: [],

    eventClick: (info: any) => {
      alert(`Reserva: ${info.event.title}`);
    },
  };

  ngOnInit(): void {
    this.adminApi.getCalendarEvents().subscribe({
      next: (events) => {
        this.calendarOptions = {
          ...this.calendarOptions,
          events,
        };
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();
        this.calendar?.getApi().removeAllEvents();
        this.calendar?.getApi().addEventSource(events);
      },
      error: () => {
        this.error = 'No se pudo cargar el calendario.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
