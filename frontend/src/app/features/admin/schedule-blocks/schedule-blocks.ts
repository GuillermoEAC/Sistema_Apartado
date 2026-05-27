import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleBlocks implements OnInit {

  blockedSchedules: BlockedSchedule[] = [];
  loading = true;
  saving = false;
  error = '';

  formData = {
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
  };

  constructor(
    private readonly adminApi: AdminApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadBlocks();
  }

  loadBlocks(): void {
    this.loading = true;
    this.adminApi.getBlocks().subscribe({
      next: (blocks) => {
        this.blockedSchedules = blocks.map((block) => this.mapBlock(block));
        this.loading = false;
        this.error = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los bloqueos.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  handleSubmit(form: NgForm): void {
    if (form.invalid || this.saving) {
      form.control.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    this.adminApi.createBlock({ ...this.formData }).subscribe({
      next: () => {
        this.saving = false;
        this.formData = this.emptyForm();
        form.resetForm(this.emptyForm());
        this.loadBlocks();
        this.cdr.detectChanges();
      },
      error: () => {
        this.saving = false;
        this.error = 'No se pudo crear el bloqueo.';
        this.cdr.detectChanges();
      },
    });
  }

  handleDelete(id: string): void {
    const confirmDelete = confirm(
      '¿Está seguro de eliminar este bloqueo?'
    );

    if (confirmDelete) {
      this.adminApi.deleteBlock(id).subscribe({
        next: () => {
          this.error = '';
          this.loadBlocks();
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'No se pudo eliminar el bloqueo.';
          this.cdr.detectChanges();
        },
      });
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

  private mapBlock(block: any): BlockedSchedule {
    const start = new Date(block.fecha_inicio);
    const end = new Date(block.fecha_fin);
    const admin = block.admin
      ? [block.admin.nombre, block.admin.apellido1].filter(Boolean).join(' ')
      : 'Admin';

    return {
      id: String(block.id_bloqueo),
      date: start.toISOString().slice(0, 10),
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      reason: block.motivo,
      createdBy: admin,
    };
  }

  private emptyForm() {
    return {
      date: '',
      startTime: '',
      endTime: '',
      reason: '',
    };
  }

  trackByBlockId(index: number, block: BlockedSchedule): string {
    return block.id;
  }
}
