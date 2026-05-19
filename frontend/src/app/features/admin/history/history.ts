import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../../core/services/admin-api.service';

interface HistoryItem {
  action: string;
  entity: string;
  date: string;
  detail: string;
}

@Component({
  selector: 'app-history',
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  items: HistoryItem[] = [];
  loading = true;
  error = '';

  constructor(private readonly adminApi: AdminApiService) {}

  ngOnInit(): void {
    this.adminApi.getHistory().subscribe({
      next: (response) => {
        this.items = response.data.map((item) => ({
          action: item.accion,
          entity: item.entidad,
          date: this.formatDate(item.created_at),
          detail: item.detalle ?? `ID relacionado: ${item.id_entidad}`,
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el historial.';
        this.loading = false;
      },
    });
  }

  private formatDate(value: string): string {
    if (!value) return 'Sin fecha';
    return new Date(value).toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
