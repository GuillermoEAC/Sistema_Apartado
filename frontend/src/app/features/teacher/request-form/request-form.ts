import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CreateSolicitudPayload, TeacherApiService } from '../../../core/services/teacher-api.service';

@Component({
  selector: 'app-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request-form.html',
  styleUrl: './request-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  ) { }

  ngOnInit(): void {
    // Revisión de la sesión en la consola (presiona F12 para ver si tu facultad está guardada)
    console.log('Datos de sesión actual:', { ...localStorage });

    const sesion = localStorage.getItem('usuario') || localStorage.getItem('user');
    if (sesion) {
      const datosUsuario = JSON.parse(sesion);
      this.formData.facultad = datosUsuario.facultad ||
        datosUsuario.escuela ||
        datosUsuario.dependencia ||
        datosUsuario.user?.facultad ||
        'Facultad no registrada';
    } else {
      this.formData.facultad = 'Facultad no registrada';
    }

    this.teacherApi.getCenters().subscribe({
      next: (centers) => {
        // Tomamos el ID real de la primera sala que mande el backend (para que la base de datos no marque error)
        const idReal = centers.length > 0 ? centers[0].id_centro : 1;

        // SOBRESCRIBIMOS la lista para que SIEMPRE exista exactamente 1 sola opción
        this.centers = [{
          id_centro: idReal,
          nombre: 'Sala de cómputo Torre Académica'
        }];

        // Seleccionamos esa única sala por defecto
        this.formData.id_centro = this.centers[0].id_centro;

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
  // --- Funciones para manejar múltiples fechas ---
  agregarFecha() {
    this.formData.fechas.push({ fecha_uso: '', hora_inicio: '', hora_fin: '' });
  }

  removerFecha(index: number) {
    if (this.formData.fechas.length > 1) {
      this.formData.fechas.splice(index, 1);
    }
  }

  enviarSolicitud(form: NgForm): void {
    if (form.invalid || this.saving) {
      form.control.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.success = '';
    this.error = '';

    // Modificamos el payload para mandar los nuevos datos
    const payload: any = { // Usamos 'any' aquí temporalmente para que no te marque error el Type de TypeScript
      id_centro: Number(this.formData.id_centro),
      facultad: this.formData.facultad,
      carrera: this.formData.carrera.trim(),
      grupo: this.formData.grupo.trim(),
      tipo_uso: this.formData.tipo_uso,
      fechas: this.formData.fechas, // Ahora esto manda un arreglo de fechas
      materia: this.formData.materia.trim(),
      num_alumnos: Number(this.formData.num_alumnos),
      proposito: this.formData.proposito.trim(),
      software_requerido: this.formData.software_requerido.trim(),
      requerimientos: this.selectedRequirements().join(', '),
    };

    this.teacherApi.createRequest(payload).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Solicitud enviada correctamente. Ahora aparecerá en pendientes para el administrador.';

        // Limpiamos el formulario conservando la facultad
        const facultadGuardada = this.formData.facultad;
        this.formData = this.emptyForm(this.centers[0]?.id_centro ?? 1);
        this.formData.facultad = facultadGuardada;

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
      facultad: '',
      carrera: '',
      grupo: '',
      tipo_uso: '',
      // Inicializamos el arreglo con una fecha vacía
      fechas: [
        { fecha_uso: '', hora_inicio: '', hora_fin: '' }
      ],
      materia: '',
      num_alumnos: 1,
      proposito: '',
      software_requerido: '',
      internet: false,
      equipo: false,
      proyector: false,
      software: false,
    };
  }

  trackByCenterId(index: number, center: any): number {
    return center.id_centro;
  }

  trackByIndex(index: number): number {
    return index;
  }
}