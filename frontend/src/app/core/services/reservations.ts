import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  private reservations = [
    {
      id: 1,
      title: 'Uso académico',
      start: '2026-03-20T08:00:00',
      end: '2026-03-20T10:00:00',
      status: 'approved',
    },
  ];

  private reservationsSubject = new BehaviorSubject(this.reservations);
  reservations$ = this.reservationsSubject.asObservable();

  getAll() {
    return this.reservations;
  }

  add(reservation: any) {
    this.reservations.push(reservation);
    this.reservationsSubject.next(this.reservations);
  }

  delete(id: number) {
    this.reservations = this.reservations.filter(r => r.id !== id);
    this.reservationsSubject.next(this.reservations);
  }
}