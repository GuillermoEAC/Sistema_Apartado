import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// 1. CREAMOS EL VALIDADOR DE LA UAS AQUÍ AFUERA
export function uasEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const correo = control.value;
    if (!correo) return null;

    const esValido = /^[a-zA-Z0-9._%+-]+@(ms\.uas\.edu\.mx|uas\.edu\.mx)$/i.test(correo);
    return esValido ? null : { dominioInvalido: true };
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  form = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(4)]],
    // 2. AGREGAMOS EL VALIDADOR AL CAMPO DEL CORREO
    correo: ['', [Validators.required, Validators.email, uasEmailValidator()]],
    facultad: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmar: ['', [Validators.required]],
  });

  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Completa todos los campos correctamente.';
      this.cdr.detectChanges();
      return;
    }

    // 1. AGREGAMOS "facultad" A LA EXTRACCIÓN DE DATOS
    const { nombreCompleto, correo, password, confirmar, facultad } = this.form.getRawValue();

    if (password !== confirmar) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.cdr.detectChanges();
      return;
    }

    const nombrePartes = this.splitNombre(nombreCompleto ?? '');
    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.authService
      .register({
        ...nombrePartes,
        correo: correo ?? '',
        password: password ?? '',
        // 2. MANDAMOS LA FACULTAD AL BACKEND
        facultad: facultad ?? '',
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Cuenta creada correctamente.';
          this.cdr.detectChanges();
          this.router.navigateByUrl('/app/dashboard');
        },
        error: (err) => {
          this.isSubmitting = false;

          let mensajeExacto = 'No se pudo crear la cuenta. Intenta de nuevo.';
          if (err.error && err.error.message) {
            mensajeExacto = Array.isArray(err.error.message)
              ? err.error.message[0]
              : err.error.message;
          }

          this.errorMessage = mensajeExacto;
          this.cdr.detectChanges();
        },
      });
  }

  private splitNombre(nombreCompleto: string) {
    const partes = nombreCompleto.trim().replace(/\s+/g, ' ').split(' ');
    if (partes.length === 1) {
      // Ojo aquí: cambié 'Profesor' por 'Usuario' para mantener consistencia con lo de hace rato
      return { nombre: partes[0], apellido1: 'Usuario' };
    }

    if (partes.length === 2) {
      return { nombre: partes[0], apellido1: partes[1] };
    }

    return {
      nombre: partes.slice(0, -2).join(' '),
      apellido1: partes.at(-2) ?? 'Usuario',
      apellido2: partes.at(-1),
    };
  }
}