import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorMessage = '';
  isSubmitting = false;

  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit() {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Ingresa un correo y contraseña válidos.';
      return;
    }

    const { correo, password } = this.form.getRawValue();
    this.isSubmitting = true;

    this.authService
      .login({
        correo: correo ?? '',
        password: password ?? '',
      })
      .subscribe({
        next: (response) => {
          const target = response.user.rol === 'admin' ? '/admin/dashboard' : '/app/dashboard';
          this.router.navigateByUrl(target);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage =
            error?.error?.message ?? 'No se pudo iniciar sesión. Revisa tus credenciales.';
        },
      });
  }
}
