import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import esLocale from '@fullcalendar/core/locales/es';
import { TeacherApiService } from '../../../core/services/teacher-api.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent implements OnInit {
  @ViewChild(FullCalendarComponent) calendar?: FullCalendarComponent;

  loading = true;
  error = '';

  constructor(
    private readonly teacherApi: TeacherApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, timeGridPlugin],
    locale: esLocale,
    height: 700,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,dayGridMonth'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '24:00:00',
    scrollTime: '07:00:00',
    allDaySlot: false,
    events: [],
  };

  ngOnInit(): void {
    this.teacherApi.getCalendarEvents().subscribe({
      next: (events) => {
        this.calendarOptions = { ...this.calendarOptions, events };
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
