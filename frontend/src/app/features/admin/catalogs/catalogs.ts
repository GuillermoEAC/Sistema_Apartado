import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AdminApiService, CentroComputo, Facultad } from '../../../core/services/admin-api.service';

@Component({
  selector: 'app-catalogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogs.html',
  styleUrl: './catalogs.scss',
})
export class Catalogs implements OnInit {
  centers: CentroComputo[] = [];
  faculties: Facultad[] = [];

  loading = true;
  savingCenter = false;
  savingFaculty = false;
  error = '';
  success = '';

  centerForm = this.emptyCenter();
  facultyForm = this.emptyFaculty();

  editingCenterId: number | null = null;
  editingFacultyId: number | null = null;

  constructor(
    private readonly adminApi: AdminApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
  }

  loadCatalogs(): void {
    this.loading = true;
    this.error = '';

    this.adminApi.getCentersAdmin().subscribe({
      next: (centers) => {
        this.centers = centers;
        this.loadFaculties();
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los centros.';
        this.cdr.detectChanges();
      },
    });
  }

  saveCenter(form: NgForm): void {
    if (form.invalid || this.savingCenter) {
      form.control.markAllAsTouched();
      return;
    }

    this.savingCenter = true;
    this.error = '';
    this.success = '';

    const payload = {
      nombre: this.centerForm.nombre.trim(),
      capacidad: Number(this.centerForm.capacidad),
      descripcion: this.centerForm.descripcion.trim(),
      activo: true,
    };

    const request = this.editingCenterId
      ? this.adminApi.updateCenter(this.editingCenterId, payload)
      : this.adminApi.createCenter(payload);

    request.subscribe({
      next: () => {
        this.savingCenter = false;
        this.success = this.editingCenterId ? 'Centro actualizado.' : 'Centro agregado.';
        this.cancelCenterEdit(form);
        this.loadCatalogs();
      },
      error: (err) => {
        this.savingCenter = false;
        this.error = err?.error?.message ?? 'No se pudo guardar el centro.';
        this.cdr.detectChanges();
      },
    });
  }

  editCenter(center: CentroComputo): void {
    this.editingCenterId = center.id_centro;
    this.centerForm = {
      nombre: center.nombre,
      capacidad: center.capacidad,
      descripcion: center.descripcion ?? '',
    };
  }

  cancelCenterEdit(form?: NgForm): void {
    this.editingCenterId = null;
    this.centerForm = this.emptyCenter();
    form?.resetForm(this.centerForm);
  }

  toggleCenter(center: CentroComputo): void {
    this.adminApi.toggleCenter(center.id_centro).subscribe({
      next: (updated) => {
        this.centers = this.centers.map((item) =>
          item.id_centro === updated.id_centro ? updated : item,
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cambiar el estado del centro.';
        this.cdr.detectChanges();
      },
    });
  }

  saveFaculty(form: NgForm): void {
    if (form.invalid || this.savingFaculty) {
      form.control.markAllAsTouched();
      return;
    }

    this.savingFaculty = true;
    this.error = '';
    this.success = '';

    const payload = {
      nombre: this.facultyForm.nombre.trim(),
      activo: true,
    };

    const request = this.editingFacultyId
      ? this.adminApi.updateFaculty(this.editingFacultyId, payload)
      : this.adminApi.createFaculty(payload);

    request.subscribe({
      next: () => {
        this.savingFaculty = false;
        this.success = this.editingFacultyId ? 'Facultad actualizada.' : 'Facultad agregada.';
        this.cancelFacultyEdit(form);
        this.loadCatalogs();
      },
      error: (err) => {
        this.savingFaculty = false;
        this.error = err?.error?.message ?? 'No se pudo guardar la facultad.';
        this.cdr.detectChanges();
      },
    });
  }

  editFaculty(faculty: Facultad): void {
    this.editingFacultyId = faculty.id_facultad;
    this.facultyForm = { nombre: faculty.nombre };
  }

  cancelFacultyEdit(form?: NgForm): void {
    this.editingFacultyId = null;
    this.facultyForm = this.emptyFaculty();
    form?.resetForm(this.facultyForm);
  }

  toggleFaculty(faculty: Facultad): void {
    this.adminApi.toggleFaculty(faculty.id_facultad).subscribe({
      next: (updated) => {
        this.faculties = this.faculties.map((item) =>
          item.id_facultad === updated.id_facultad ? updated : item,
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cambiar el estado de la facultad.';
        this.cdr.detectChanges();
      },
    });
  }

  private loadFaculties(): void {
    this.adminApi.getFacultiesAdmin().subscribe({
      next: (faculties) => {
        this.faculties = faculties;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar las facultades.';
        this.cdr.detectChanges();
      },
    });
  }

  private emptyCenter() {
    return {
      nombre: '',
      capacidad: 30,
      descripcion: '',
    };
  }

  private emptyFaculty() {
    return {
      nombre: '',
    };
  }
}
