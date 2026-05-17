import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

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
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {

  days = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
  ];

  hours = [
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  reservations: Reservation[] = [
    {
      day: 'Lunes',
      hour: '09:00',
      professor: 'Dr. Juan Pérez',
      group: 'Grupo A',
      status: 'reserved',
    },
    {
      day: 'Lunes',
      hour: '14:00',
      professor: 'Dra. María González',
      group: 'Grupo B',
      status: 'pending',
    },
    {
      day: 'Martes',
      hour: '10:00',
      professor: 'Ing. Carlos Rodríguez',
      group: 'Grupo C',
      status: 'reserved',
    },
    {
      day: 'Martes',
      hour: '15:00',
      professor: 'Sistema',
      group: 'Mantenimiento',
      status: 'blocked',
    },
    {
      day: 'Miércoles',
      hour: '08:00',
      professor: 'Dr. Juan Pérez',
      group: 'Grupo A',
      status: 'reserved',
    },
    {
      day: 'Miércoles',
      hour: '11:00',
      professor: 'Dra. Ana Martínez',
      group: 'Grupo D',
      status: 'pending',
    },
    {
      day: 'Jueves',
      hour: '09:00',
      professor: 'Ing. Roberto Silva',
      group: 'Grupo E',
      status: 'reserved',
    },
    {
      day: 'Viernes',
      hour: '10:00',
      professor: 'Dra. María González',
      group: 'Grupo B',
      status: 'reserved',
    },
    {
      day: 'Viernes',
      hour: '13:00',
      professor: 'Dr. Fernando López',
      group: 'Grupo F',
      status: 'pending',
    },
  ];

  getReservation(day: string, hour: string): Reservation | undefined {
    return this.reservations.find(
      (r) => r.day === day && r.hour === hour
    );
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'reserved':
        return 'bg-green-100 border-green-300 text-green-900';

      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900';

      case 'blocked':
        return 'bg-red-100 border-red-300 text-red-900';

      default:
        return 'bg-white border-gray-200 text-gray-600';
    }
  }

  getDayDate(day: string): string {
    switch (day) {
      case 'Lunes':
        return '13 Mar';

      case 'Martes':
        return '14 Mar';

      case 'Miércoles':
        return '15 Mar';

      case 'Jueves':
        return '16 Mar';

      default:
        return '17 Mar';
    }
  }

  getReservedCount(): number {
    return this.reservations.filter(
      (r) => r.status === 'reserved'
    ).length;
  }

  getPendingCount(): number {
    return this.reservations.filter(
      (r) => r.status === 'pending'
    ).length;
  }

  getBlockedCount(): number {
    return this.reservations.filter(
      (r) => r.status === 'blocked'
    ).length;
  }

}
