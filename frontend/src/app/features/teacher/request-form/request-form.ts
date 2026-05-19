import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CreateSolicitudPayload, TeacherApiService } from '../../../core/services/teacher-api.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-form.html',
  styleUrl: './request-form.scss',
})
export class RequestFormComponent implements OnInit {
  centers: any[] = [];
  loadingCenters = true;
  saving = false;
  success = '';
  error = '';

  formData = this.emptyForm();

  constructor(
    private readonly teacherApi: TeacherApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.teacherApi.getCenters().subscribe({
      next: (centers) => {
        this.centers = centers;
        this.formData.id_centro = centers[0]?.id_centro ?? 1;
        this.loadingCenters = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los centros de cómputo.';
        this.loadingCenters = false;
        this.cdr.detectChanges();
      },
    });
  }

  enviarSolicitud(form: NgForm): void {
    if (form.invalid || this.saving) {
      form.control.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.success = '';
    this.error = '';

    const payload: CreateSolicitudPayload = {
      id_centro: Number(this.formData.id_centro),
      fecha_uso: this.formData.fecha_uso,
      hora_inicio: this.formData.hora_inicio,
      hora_fin: this.formData.hora_fin,
      materia: this.formData.materia.trim(),
      grupo: this.formData.grupo.trim(),
      num_alumnos: Number(this.formData.num_alumnos),
      proposito: this.formData.proposito.trim(),
      software_requerido: this.formData.software_requerido.trim(),
      requerimientos: this.selectedRequirements().join(', '),
    };

    this.teacherApi.createRequest(payload).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Solicitud enviada correctamente. Ahora aparecerá en pendientes para el administrador.';
        this.formData = this.emptyForm(this.centers[0]?.id_centro ?? 1);
        form.resetForm(this.formData);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message ?? 'No se pudo enviar la solicitud.';
        this.cdr.detectChanges();
      },
    });
  }

  private selectedRequirements(): string[] {
    const entries = [
      ['Internet', this.formData.internet],
      ['Equipo de cómputo', this.formData.equipo],
      ['Proyector', this.formData.proyector],
      ['Software especializado', this.formData.software],
    ];

    return entries.filter(([, selected]) => selected).map(([label]) => label as string);
  }

  private emptyForm(id_centro = 1) {
    return {
      id_centro,
      fecha_uso: '',
      hora_inicio: '',
      hora_fin: '',
      materia: '',
      grupo: '',
      num_alumnos: 1,
      proposito: '',
      software_requerido: '',
      internet: false,
      equipo: false,
      proyector: false,
      software: false,
    };
  }
}
