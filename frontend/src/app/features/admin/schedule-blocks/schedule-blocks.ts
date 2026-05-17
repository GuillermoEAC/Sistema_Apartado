import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BlockedSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdBy: string;
}

@Component({
  selector: 'app-schedule-blocks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-blocks.html',
  styleUrl: './schedule-blocks.scss',
})
export class ScheduleBlocks {

  blockedSchedules: BlockedSchedule[] = [
    {
      id: '1',
      date: '2026-03-14',
      startTime: '15:00',
      endTime: '17:00',
      reason: 'Mantenimiento de equipos',
      createdBy: 'Admin',
    },
    {
      id: '2',
      date: '2026-03-21',
      startTime: '08:00',
      endTime: '10:00',
      reason: 'Actualización de software',
      createdBy: 'Admin',
    },
  ];

  formData = {
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
  };

  handleSubmit(): void {
    const newBlock: BlockedSchedule = {
      id: Date.now().toString(),
      date: this.formData.date,
      startTime: this.formData.startTime,
      endTime: this.formData.endTime,
      reason: this.formData.reason,
      createdBy: 'Admin',
    };

    this.blockedSchedules = [
      ...this.blockedSchedules,
      newBlock,
    ];

    this.formData = {
      date: '',
      startTime: '',
      endTime: '',
      reason: '',
    };
  }

  handleDelete(id: string): void {
    const confirmDelete = confirm(
      '¿Está seguro de eliminar este bloqueo?'
    );

    if (confirmDelete) {
      this.blockedSchedules = this.blockedSchedules.filter(
        (b) => b.id !== id
      );
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
